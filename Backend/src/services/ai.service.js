const { GoogleGenerativeAI } = require("@google/generative-ai")
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")
const { extractKeywordsLocally } = require("../utils/keyword.util")

// Support multiple API keys with load balancing + retries.
function getApiKeys() {
  const raw =
    process.env.GOOGLE_GENAI_API_KEYS ||
    process.env.GEMINI_API_KEYS ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function getModelCandidates() {
  const preferred =
    process.env.GEMINI_MODEL ||
    process.env.GOOGLE_GENAI_MODEL ||
    "gemini-2.0-flash";

  // Try preferred first, then practical fallbacks.
  return [...new Set([preferred, "gemini-2.0-flash", "gemini-1.5-flash"])];
}

/**
 * Returns a GoogleGenerativeAI instance for one key.
 */
function getAIInstance(apiKey) {
  return new GoogleGenerativeAI(apiKey || "");
}

const MODEL = getModelCandidates()[0];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(rawText) {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid AI response: no JSON object found");
  }
  return JSON.parse(jsonMatch[0]);
}

const interviewReportSchema = z.object({
  matchScore: z.number().describe("A score between 0 and 100 indicating how well candidate's portfolio scores on the required job level"),
  technicalQuestions: z.array(z.object({
    question: z.string().describe("The technical question that can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question,what points to cover,what appraoch can be taken etc. ")

  })).describe("Technical questions that can be asked in the interview and the intention behind asking of the question and how to answer the question that  were asked"),
  behavioralQuestions: z.array(z.object({
    question: z.string().describe("The behavioral question that can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question,what points to cover,what appraoch can be taken etc. ")

  })).describe("Behavioral questions that can be asked in the interview and the intention behind aksing the question and describe approach about how to answer those questions"),

  skillGaps: z.array(z.object({
    skill: z.string().describe("The skill which the candidate is lacking"),
    severity: z.enum(['low', 'medium', 'high']).describe("The severity of this skill gap i.e. how important is the mentioned skill gap ")
  })).describe("List of all skill gaps in the candidate's profile along with their severity"),

  preparationPlan: z.array(z.object({
    day: z.number().describe("The day number in the preparation plan,starting from 1"),
    focus: z.string().describe("The main focus of this day in the preparation plan e.g. data structures,system design,mock interview etc"),
    tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan e.g. read a specific book,topics etc"),
  })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),

})

function buildLocalFallbackInterviewReport({ resume = "", selfDescription = "", jobDescription = "" }) {
  const jdKeywords = extractKeywordsLocally(jobDescription);
  const profileKeywords = extractKeywordsLocally(`${resume}\n${selfDescription}`);

  const jdSet = new Set(jdKeywords.map(k => k.toLowerCase()));
  const profileSet = new Set(profileKeywords.map(k => k.toLowerCase()));

  const overlap = [...jdSet].filter(k => profileSet.has(k));
  const coverage = jdSet.size ? overlap.length / jdSet.size : 0;

  const matchScore = Math.max(25, Math.min(95, Math.round(coverage * 100)));

  const missing = [...jdSet].filter(k => !profileSet.has(k)).slice(0, 8);

  const dynamicFocus = [...new Set([...(overlap.slice(0, 4)), ...(missing.slice(0, 4))])].filter(Boolean);
  const roleHint = jdKeywords.slice(0, 3).join(", ") || "the target role";

  const technicalQuestions = (dynamicFocus.length ? dynamicFocus : ["system design", "performance", "testing", "debugging", "architecture"])
    .slice(0, 5)
    .map((topic) => ({
      question: `How would you apply ${topic} in ${roleHint}? Explain your approach with a concrete example.`,
      intention: `Evaluate depth in ${topic} and practical execution for this specific role.`,
      answer: `Describe one real project, design decisions, trade-offs, and measurable outcomes tied to ${topic}.`
    }));

  const behavioralQuestions = [
    {
      question: `Tell me about a time you quickly learned a missing skill (${missing[0] || "new domain skill"}) to meet a deadline.`,
      intention: "Assess adaptability and growth under pressure.",
      answer: "Use STAR and focus on learning plan, execution speed, and final impact."
    },
    {
      question: "Describe a situation where requirements changed late. How did you reprioritize and communicate?",
      intention: "Assess communication, planning, and stakeholder management.",
      answer: "Explain trade-offs, impact analysis, and how you kept delivery predictable."
    },
    {
      question: "Tell me about a difficult bug or incident you owned end-to-end.",
      intention: "Assess ownership and debugging discipline.",
      answer: "Cover hypothesis, instrumentation, fix, prevention, and lessons learned."
    }
  ];

  const skillGaps = missing.map(k => ({
    skill: k.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    severity: "medium"
  }));

  const preparationPlan = Array.from({ length: 7 }).map((_, idx) => {
    const day = idx + 1;
    const focus = day === 1 ? "Understand role requirements" :
      day === 2 ? "Core frontend fundamentals" :
        day === 3 ? "System design basics" :
          day === 4 ? "Project deep dive" :
            day === 5 ? "Mock interview practice" :
              day === 6 ? "Targeted gap filling" :
                "Final revision & interview readiness";

    const tasks = [
      `Review the JD and list key expectations (${jdKeywords.slice(0, 8).join(", ") || "N/A"})`,
      "Prepare 3 STAR stories (impact, conflict, failure/learning)",
      "Do 2 coding problems focusing on clarity and edge cases",
      ...(missing.length ? [`Pick 1 missing skill to study: ${missing[0]}`] : [])
    ];

    return { day, focus, tasks };
  });

  return {
    matchScore,
    technicalQuestions,
    behavioralQuestions,
    skillGaps,
    preparationPlan
  };
}

async function generatePdfFromHTML(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  })
  const page = await browser.newPage()
  await page.setContent(htmlContent, { waitUntil: "networkidle0" })

  console.log("Puppeteer: Starting PDF generation...");
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "1cm", bottom: "1cm", left: "1cm", right: "1cm" }
  })
  await browser.close()
  console.log(`Puppeteer: PDF generated successfully. Size: ${pdfBuffer.length} bytes`);
  return pdfBuffer
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  const prompt = `
Generate an interview report.

Return ONLY valid JSON with EXACTLY these keys:
- matchScore(number)
- technicalQuestions (array)
- behavioralQuestions (array)
- skillGaps (array)
- preparationPlan (array)

Rules:
- Do NOT omit any key
- If no data, return empty array []
- Do NOT add extra fields
- Do NOT return markdown or text

Schema:
{
  "matchScore":Number,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low | medium | high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;
  const apiKeys = getApiKeys();
  const modelCandidates = getModelCandidates();

  if (!apiKeys.length) {
    console.warn("[AI SERVICE] No Gemini API key found. Falling back to local interview report generator.");
    return buildLocalFallbackInterviewReport({ resume, selfDescription, jobDescription });
  }

  const retriableStatuses = new Set([429, 500, 502, 503, 504]);
  let sawRateLimit = false;
  let lastError = null;

  // Two passes: immediate + one short cooldown pass.
  for (let pass = 0; pass < 2; pass++) {
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
      for (const modelName of modelCandidates) {
        try {
          console.log(`[AI SERVICE] Trying key ${keyIndex + 1}/${apiKeys.length} with model "${modelName}" (pass ${pass + 1})`);
          const aiInstance = getAIInstance(apiKeys[keyIndex]);
          const model = aiInstance.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const data = extractJsonObject(response.text());
          const validated = interviewReportSchema.safeParse(data);

          if (!validated.success) {
            throw new Error("AI output does not match the expected format");
          }

          return validated.data;
        } catch (err) {
          lastError = err;
          const status = err?.status || err?.response?.status;
          const message = err?.message || "Unknown Gemini error";

          if (status === 429) {
            sawRateLimit = true;
          }

          // Model not available for this key; try next model/key.
          if (status === 404) {
            console.warn(`[AI SERVICE] Model "${modelName}" unavailable for current key: ${message}`);
            continue;
          }

          if (retriableStatuses.has(status)) {
            console.warn(`[AI SERVICE] Retriable Gemini error (${status}): ${message}`);
            continue;
          }

          const e = new Error(`Gemini request failed: ${message}`);
          e.status = status || 502;
          throw e;
        }
      }
    }

    if (pass === 0) {
      await sleep(800);
    }
  }

  if (sawRateLimit) {
    console.warn("[AI SERVICE] All Gemini API keys/models are currently rate-limited. Falling back to local interview report generator.");
    return buildLocalFallbackInterviewReport({ resume, selfDescription, jobDescription });
  }

  const finalError = new Error(`Gemini request failed after trying all keys/models: ${lastError?.message || "Unknown error"}`);
  finalError.status = lastError?.status || lastError?.response?.status || 502;
  throw finalError;
} // End of generateInterviewReport function

async function generateResumePdf(selfDescription, resume, jobDescription) {
  const resumepdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume for which can be converted to pdf.")
  });
  
  const prompt = `Generate a resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                        
                        Output Format: Return ONLY valid JSON: {"html": "<complete_html_string>"}`;

  const apiKeys = getApiKeys();
  if (!apiKeys.length) {
    const aiError = new Error("No Gemini API key configured");
    aiError.status = 500;
    throw aiError;
  }

  const modelCandidates = getModelCandidates();
  let attempts = 0;
  const maxAttempts = Math.max(apiKeys.length * modelCandidates.length, 2);

  while (attempts < maxAttempts) {
    try {
      const keyIndex = attempts % apiKeys.length;
      const modelName = modelCandidates[Math.floor(attempts / apiKeys.length) % modelCandidates.length];
      const aiInstance = getAIInstance(apiKeys[keyIndex]);
      const model = aiInstance.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response for Resume PDF:\n" + responseText);

      const jsonContent = JSON.parse(jsonMatch[0]);
      return await generatePdfFromHTML(jsonContent.html);
    } catch (err) {
      attempts++;
      const status = err.status || err?.response?.status;

      if (status === 429 && attempts < maxAttempts) {
        console.warn(`[AI SERVICE] Rate limit hit. Retrying instantly with different key... (Attempt ${attempts})`);
        continue; // Instant retry with a new random key
      }

      if (status === 429) {
        const aiError = new Error("AI Rate Limit Reached");
        aiError.status = 429;
        throw aiError;
      }

      throw err;
    }
  }
}

/**
 * LaTeX-styled fallback resume generator (High Content Density)
 */
async function buildLocalFallbackResume(selfDescription, resume, jobDescription) {
  const lines = resume.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const name = lines[0] || "Your Full Name";

  const emailMatch = resume.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "candidate@example.com";

  const phoneMatch = resume.match(/(\+?\d{1,3}[- ]?)?\d{10}/);
  const phone = phoneMatch ? phoneMatch[0] : "+91-0000000000";

  // Deeper extraction for more content
  const sections = { objective: '', skills: [], experience: [], projects: [], education: [], certs: [], achievements: [] };
  let currentSec = '';

  lines.forEach(line => {
    const l = line.toLowerCase();
    if (l.includes('objective') || l.includes('summary')) currentSec = 'objective';
    else if (l.includes('skills')) currentSec = 'skills';
    else if (l.includes('experience')) currentSec = 'experience';
    else if (l.includes('projects')) currentSec = 'projects';
    else if (l.includes('education')) currentSec = 'education';
    else if (l.includes('certifications')) currentSec = 'certs';
    else if (l.includes('achievements')) currentSec = 'achievements';
    else if (currentSec) {
      if (currentSec === 'objective') sections.objective += line + ' ';
      else sections[currentSec].push(line);
    }
  });

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 0.45in 0.5in; }
        body { font-family: 'Times New Roman', serif; line-height: 1.1; color: #000; font-size: 13px; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 8px; }
        .name { font-size: 24px; font-weight: bold; margin: 0; }
        .contact { font-size: 11px; margin-top: 2px; }
        .section { margin-top: 10px; }
        .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0; padding-bottom: 1px; border-bottom: 1px solid #000; }
        .summary { text-align: justify; margin: 4px 0; font-size: 12px; }
        .item-row { display: table; width: 100%; margin-top: 4px; }
        .item-left { display: table-cell; text-align: left; font-weight: bold; }
        .item-right { display: table-cell; text-align: right; font-weight: normal; font-size: 11px; }
        .sub-item { font-size: 11px; font-style: italic; margin-top: 1px; }
        .bullet-list { margin: 2px 0 0 0; padding-left: 1.2em; }
        .bullet { margin-bottom: 1px; font-size: 12px; }
        .skill-line { margin-top: 3px; font-size: 12px; }
        a { color: #000; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${name}</div>
        <div class="contact">
          City, State | ${phone} | <a href="mailto:${email}">${email}</a><br>
          LinkedIn | GitHub | Portfolio
        </div>
      </div>

      <div class="section">
        <div class="section-title">Career Objective</div>
        <div class="summary">${sections.objective || "Aspiring Software Engineer with expertise in Node.js, Express.js, and MongoDB, focused on building scalable and high-performance backend systems."}</div>
      </div>

      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skill-line"><strong>Languages:</strong> JavaScript, C++, Python, SQL</div>
        <div class="skill-line"><strong>Backend:</strong> Node.js, Express.js, REST APIs, WebSockets, JWT</div>
        <div class="skill-line"><strong>Databases:</strong> MongoDB, MySQL, DBMS Concepts</div>
        <div class="skill-line"><strong>Tools:</strong> Docker, Git, Postman, Puppeteer, VS Code</div>
      </div>

      <div class="section">
        <div class="section-title">Experience & Projects</div>
        
        <div class="item-row">
          <span class="item-left">Project Title 1: Key Feature</span>
          <span class="item-right">Month Year -- Month Year</span>
        </div>
        <ul class="bullet-list">
          <li class="bullet">Developed high-performance features using Node.js and React.</li>
          <li class="bullet">Optimized database queries and improved system response time.</li>
        </ul>

        <div style="margin-top: 5px;" class="item-row">
          <span class="item-left">Project Title 2: Technical Solution</span>
          <span class="item-right">Month Year -- Month Year</span>
        </div>
        <ul class="bullet-list">
          <li class="bullet">Built a scalable full-stack platform for specialized user needs.</li>
          <li class="bullet">Integrated third-party APIs and cloud services.</li>
        </ul>

        ${sections.projects.length > 0 ? sections.projects.slice(0, 8).map(p => `<div class="bullet">${p}</div>`).join('') : ''}
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        <div class="item-row">
          <span class="item-left">Degree Name in Field of Study</span>
          <span class="item-right">2023 -- 2027</span>
        </div>
        <div style="font-size: 12px;">University Name, Location | Grade/GPA</div>
      </div>

      <div class="section">
        <div class="section-title">Certifications & Achievements</div>
        <ul class="bullet-list">
          <li class="bullet">Oracle Cloud Infrastructure (OCI) — AI Foundations (2025)</li>
          <li class="bullet">Solved 700+ DSA problems on LeetCode (Rating 1800+).</li>
          <li class="bullet">Participated in Adobe India and ISRO hackathons.</li>
        </ul>
      </div>
    </body>
  </html>
  `;

  return await generatePdfFromHTML(html);
}

/**
 * Extracts all relevant keywords/skills from a JD using Gemini
 */
async function extractKeywordsFromJD(jobDescription) {
  const prompt = `Extract ALL important technical skills, professional keywords, and required tools from this job description. Return them as a JSON array of strings. 
  
  JD: ${jobDescription}
  
  Format: ["Keyword1", "Keyword2", ... "KeywordN"]`;

  try {
    const apiKeys = getApiKeys();
    if (!apiKeys.length) {
      throw new Error("No Gemini API key configured");
    }
    const aiInstance = getAIInstance(apiKeys[0]);
    const model = aiInstance.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    let data = JSON.parse(responseText);

    // Handle both ["a", "b"] and { "keywords": ["a", "b"] }
    if (!Array.isArray(data) && data.keywords) {
      data = data.keywords;
    } else if (!Array.isArray(data) && data.skills) {
      data = data.skills;
    }

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Keyword extraction failed in AI Service: ${err.message}. Falling back to local...`);

    // Robust backend local fallback
    const techKeywords = [
      "React", "Node", "Javascript", "Typescript", "Python", "Java", "PHP", "SQL", "MongoDB", "PostgreSQL",
      "AWS", "Docker", "Kubernetes", "Azure", "GCP", "HTML", "CSS", "Sass", "Tailwind", "Bootstrap",
      "Redux", "GraphQL", "REST", "Agile", "Scrum", "Git", "GitHub", "Jenkins", "CI/CD", "Testing",
      "Jest", "Cypress", "Software", "Developer", "Engineer", "Frontend", "Backend", "Fullstack",
      "Mobile", "Android", "iOS", "Flutter", "React Native", "Angular", "Vue", "Next.js", "Express",
      "Spring Boot", "Django", "Flask", "Machine Learning", "AI", "Data Science", "DevOps", "Security",
      "Cloud", "Infrastructure", "Linux", "Unix", "Database", "Microservices", "Serverless", "API",
      "Fresher", "Junior", "Senior", "Lead", "Architect", "Project Management", "Product Management",
      "Figma", "Postman", "Terraform", "Ansible", "Nginx", "Redis", "Kafka", "Elasticsearch"
    ];

    const text = jobDescription.toLowerCase();
    const found = techKeywords.filter(kw => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return regex.test(text);
    });

    if (found.length > 0) {
      return [...new Set(found)];
    }

    // Last resort: extract capitalized words
    const words = jobDescription.match(/[A-Z][a-z]+/g) || [];
    const ignore = ["This", "That", "With", "Your", "From", "Have", "Skills", "Based", "Salary", "Perks", "Benefits"];
    const filtered = words.filter(w => w.length > 3 && !ignore.includes(w));
    return [...new Set(filtered)];
  }
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  extractKeywordsFromJD
}
const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
})

const MODEL =
  process.env.GEMINI_MODEL ||
  process.env.GOOGLE_GENAI_MODEL ||
  "gemini-2.5-flash";

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

async function generatePdfFromHTML(htmlContent) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlContent, { waitUntil: "networkidle0" })

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "1cm", bottom: "1cm", left: "1cm", right: "1cm" }
  })
  await browser.close()
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
  try {
    console.log(`Calling Gemini AI with model: ${MODEL}`);
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generation_config: {
        response_mime_type: "application/json",
        response_schema: zodToJsonSchema(interviewReportSchema)
      }
    });

    const raw = response.text;

    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid AI response:\n" + raw);
    }

    const data = JSON.parse(jsonMatch[0]);

    const validated = interviewReportSchema.safeParse(data);

    if (!validated.success) {
      console.error("AI Response Schema Validation Failed:", validated.error);
      console.log("Raw AI response was:", raw);
      throw new Error("AI output does not match the expected format");
    }

    return validated.data;
  } catch (err) {
    const status = err?.status || err?.response?.status;
    const message = err?.message || "Unknown AI error";

    if (status === 404) {
      const e = new Error(
        `Gemini model/endpoint not found (model="${MODEL}"). ` +
        `Update GEMINI_MODEL or verify your API key has access. Original error: ${message}`
      );
      e.status = 502;
      throw e;
    }

    const e = new Error(`Gemini request failed: ${message}`);
    e.status = status || 502;
    throw e;
  }
}


async function generateResumePdf(selfDescription, resume, jobDescription) {
  const resumepdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume for which can be converted to pdf. It is using a library known as puppeteer for converting the html content of the resume to pdf. You can refer this github link for more information about the library https://github.com/puppeteer/puppeteer for more information")
  })
  const prompt = `Generate a resume PDF for a candidate with the following details:
  Resume: ${resume}
  Self Description: ${selfDescription}
  Job Description: ${jobDescription}



  the resume should be a JSON object with a single field "html" which contain the html content of the resume for which can be converted to pdf. It is using a library known as puppeteer for converting the html content of the resume to pdf. You can refer this github link for more information about the library https://github.com/puppeteer/puppeteer for more information
  `

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumepdfSchema),
    }
  })
  const jsonContent = JSON.parse(response.text)


  // converting the json to pdf

  const pdfBuffer = await generatePdfFromHTML(jsonContent.html)
  return pdfBuffer
}
module.exports = generateInterviewReport
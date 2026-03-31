const {GoogleGenAI}=require("@google/genai")
const {z}=require("zod");
const {zodToJsonSchema}=require("zod-to-json-schema")

const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema=z.object({
    testScore:z.number().describe("A score between 0 and 100 indicating how well candidate's portfolio scores on the required job level"),
    technicalQuestions:z.array(z.object({
        question:z.string().describe("The technical question that can be asked in the interview"),
        intention:z.string().describe("The intention of interviewer behind asking this question"),
        answer:z.string().describe("How to answer this question,what points to cover,what appraoch can be taken etc. ")

    })).describe("Technical questions that can be asked in the interview and the intention behind asking of the question and how to answer the question that  were asked"),
    behavioralQuestions:z.array(z.object({
         question:z.string().describe("The behavioral question that can be asked in the interview"),
        intention:z.string().describe("The intention of interviewer behind asking this question"),
        answer:z.string().describe("How to answer this question,what points to cover,what appraoch can be taken etc. ")

    })).describe("Behavioral questions that can be asked in the interview and the intention behind aksing the question and describe approach about how to answer those questions"),

    skillGaps:z.array(z.object({
        skill:z.string().describe("The skill which the candidate is lacking"),
        severity:z.enum(['low','medium','high']).describe("The severity of this skill gap i.e. how important is the mentioned skill gap ")
    })).describe("List of all skill gaps in the candidate's profile along with their severity"),

    preparationPlan:z.array(z.object({
        day:z.number().describe("The day number in the preparation plan,starting from 1"),
        focus:z.string().describe("The main focus of this day in the preparation plan e.g. data structures,system design,mock interview etc"),
        tasks:z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan e.g. read a specific book,topics etc"),
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    
})

async function generateInterviewReport({resume,selfDescription,jobDescription}){

const prompt = `
Generate an interview report.

Return ONLY valid JSON with EXACTLY these keys:
-testScore(number)
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
  "testScore":Number,
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
   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
    console.error(validated.error);
    throw new Error("Schema validation failed");
}

return validated.data;
}
module.exports=generateInterviewReport
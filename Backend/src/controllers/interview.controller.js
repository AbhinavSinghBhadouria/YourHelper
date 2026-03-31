const pfdParse=require("pdf-parse")
const generateInterviewReport=require("../services/ai.service")
const interviewReportModel=require("../models/interviewReport.model")


async function generateInterViewReportController(req,res){

const resumeContent=await (new pfdParse.PDFParse(Uint8Array.from(req.file.buffer)).getText()
const {selfDescription,jobDescription}=req.body

const interViewReportByAI=await generateInterviewReport({
    resume:resumeContent.text,
    selfDescription,
    jobDescription
})

const interviewReport=await interviewReportModel.create({
    user:req.user.id,
    resume:resumeContent.text,
    selfDescription,
    jobDescription,
    ...interViewReportByAI
})

res.status(201).json({
    message:"Interview report generated successfully:",
    interviewReport
})
}


module.exports={generateInterViewReportController}
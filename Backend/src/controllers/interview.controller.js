const { PDFParse } = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            console.log("No file provided in request");
            return res.status(400).json({ message: "Resume file is required" });
        }

        console.log("Parsing PDF resume...");
        const parser = new PDFParse({ data: req.file.buffer });
        const data = await parser.getText();
        const resumeText = data.text;
        
        const { selfDescription, jobDescription, title } = req.body;
        console.log("Request details:", { title, jobDescLength: jobDescription?.length });

        const interViewReportByAI = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            title: title || "Interview Report",
            ...interViewReportByAI
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (error) {
        console.error("Error generating interview report:", error);
        
        // Check if it's an AI service error
        const isAIError = error.message?.includes("Gemini") || error.message?.includes("AI") || !!error.status;
        const statusCode = error.status || 500;
        
        res.status(statusCode).json({ 
            message: isAIError ? "AI Service Error: " + error.message : "Error generating interview report", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { id } = req.params;
        const report = await interviewReportModel.findById(id);

        if (!report) {
            return res.status(404).json({ message: "Interview report not found" });
        }

        // Ensure user owns this report
        if (report.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized access to this report" });
        }

        res.status(200).json({ interviewReport: report });
    } catch (error) {
        res.status(500).json({ message: "Error fetching interview report", error: error.message });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const reports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ interviewReports: reports });
    } catch (error) {
        res.status(500).json({ message: "Error fetching interview reports", error: error.message });
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController,
    getAllInterviewReportsController 
}
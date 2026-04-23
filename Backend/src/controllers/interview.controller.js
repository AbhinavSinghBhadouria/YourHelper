const pdfParse = require("pdf-parse")
const mammoth = require("mammoth")
const { ocrPdfBuffer } = require("../services/ocr.service")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const crypto = require("crypto")

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription, title } = req.body;
        const normalizedJobDescription = typeof jobDescription === "string" ? jobDescription.trim() : "";
        const normalizedSelfDescription = typeof selfDescription === "string" ? selfDescription.trim() : "";
        
        if (!normalizedJobDescription) {
            return res.status(400).json({ message: "Job description is required" });
        }

        let resumeText = "";
        let ocrAttempted = false;
        let ocrFailedReason = "";
        if (req.file) {
            try {
                const original = (req.file.originalname || "").toLowerCase()
                const mime = (req.file.mimetype || "").toLowerCase()

                const isPdf = mime === "application/pdf" || original.endsWith(".pdf")
                const isDocx =
                    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                    original.endsWith(".docx")

                if (isPdf) {
                    console.log("Parsing PDF resume...")
                    // Fixed: pdf-parse on this system requires 'new' for its main function
                    // Defensive copies: some PDF libraries may mutate/detach underlying buffers.
                    const pdfBufferForParse = Buffer.from(req.file.buffer)
                    const pdfBufferForOcr = Buffer.from(req.file.buffer)

                    const data = await pdfParse(pdfBufferForParse)
                    resumeText = data.text || ""

                    if (!resumeText || !resumeText.trim()) {
                        console.log("PDF text empty; running OCR fallback (first pages)...")
                        ocrAttempted = true;
                        resumeText = await ocrPdfBuffer(pdfBufferForOcr, { maxPages: 2, scale: 2 })
                    }
                } else if (isDocx) {
                    console.log("Parsing DOCX resume...")
                    const result = await mammoth.extractRawText({ buffer: req.file.buffer })
                    resumeText = result.value || ""
                } else {
                    return res.status(400).json({
                        message: "Unsupported resume format. Please upload a PDF or DOCX file."
                    })
                }
            } catch (error) {
                console.error("Resume parsing error:", error);
                // If PDF parsing failed, attempt OCR as a fallback before giving up.
                try {
                    const original = (req.file.originalname || "").toLowerCase()
                    const mime = (req.file.mimetype || "").toLowerCase()
                    const isPdf = mime === "application/pdf" || original.endsWith(".pdf")
                    if (isPdf) {
                        console.log("PDF parsing failed; running OCR fallback (first pages)...")
                        ocrAttempted = true;
                        resumeText = await ocrPdfBuffer(Buffer.from(req.file.buffer), { maxPages: 2, scale: 2 })
                    }
                } catch (ocrError) {
                    ocrFailedReason = ocrError?.message || "OCR failed";
                    console.error("OCR fallback error:", ocrError);
                }
            }
        }

        const normalizedResumeText = typeof resumeText === "string" ? resumeText.trim() : "";
        console.log(`Final Profile Context: Resume(${normalizedResumeText.length} chars), Self-Desc(${normalizedSelfDescription.length} chars)`);

        // If user uploaded a file but we couldn't extract text, be explicit about next steps.
        if (req.file && !normalizedResumeText && !normalizedSelfDescription) {
            console.warn("Extraction failed: req.file present but no text found and no self-description provided.");
            return res.status(400).json({
                message:
                    ocrAttempted
                        ? `We couldn't extract text from your resume even after OCR. Please upload a text-based PDF/DOCX or add a self-description. ${
                              ocrFailedReason ? `(OCR error: ${ocrFailedReason})` : ""
                          }`
                        : "We couldn't extract text from your resume. Please upload a text-based PDF/DOCX (not a scanned image) or add a self-description."
            });
        }

        if (!normalizedResumeText && !normalizedSelfDescription) {
            return res.status(400).json({ message: "Either a resume or a self-description is required" });
        }

        console.log("Request details:", { title, jobDescLength: jobDescription?.length });

        const interViewReportByAI = await generateInterviewReport({
            resume: normalizedResumeText,
            selfDescription: normalizedSelfDescription,
            jobDescription: normalizedJobDescription
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

async function downloadResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findById(interviewReportId);
        
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found" });
        }

        // Security: Ensure user owns this report
        if (interviewReport.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Unauthorized access to this report" });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        
        console.log("Generating tailored resume PDF via AI...");
        const pdfBuffer = await generateResumePdf(selfDescription || "", resume || "", jobDescription || "");

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=Tailored_Resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            message: "Error generating tailored resume PDF: " + error.message,
            error: error.message
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    downloadResumePdfController
}
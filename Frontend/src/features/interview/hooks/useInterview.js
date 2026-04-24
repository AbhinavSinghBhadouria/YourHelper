import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { InterviewContext } from "../interview.context";
import { 
    getAllInterviewReports, 
    getInterviewReportById, 
    generateInterviewReport,
    downloadResumePdf,
    downloadResumePdfFromPayload
} from "../services/interview.api.js";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        setError(null);
        let response = null;
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate report");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (interviewId) => {
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch report");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllInterviewReports();
            setReports(response.interviewReports);
            return response.interviewReports;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (reportInput) => {
        const id = typeof reportInput === "string" ? reportInput : reportInput?._id;
        try {
            let blob = null;
            try {
                blob = await downloadResumePdf(id);
            } catch (primaryErr) {
                if (primaryErr?.response?.status !== 404 || !reportInput || typeof reportInput === "string") {
                    throw primaryErr;
                }
                // Fallback path when the report document id is missing/stale in DB.
                blob = await downloadResumePdfFromPayload({
                    interviewReportId: reportInput?._id,
                    resume: reportInput?.resume || "",
                    selfDescription: reportInput?.selfDescription || "",
                    jobDescription: reportInput?.jobDescription || ""
                });
            }
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            
            // Create a temporary anchor element for downloading
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Tailored_Resume_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (err) {
            // Handle specific status codes
            const status = err.response?.status;
            
            if (status === 429) {
                // AI Limit Reached - Handled silently with redirect
                navigate("/error/ai-limit");
            } else if (status === 403) {
                // Premium Required - Handled silently with redirect
                setError("Premium required for PDF downloads");
                navigate("/pricing");
            } else {
                // Real unknown error - Log it
                console.error("Download error:", err);
                setError("Failed to download PDF");
            }
        }
    };

    return {
        report,
        loading,
        error,
        reports,
        getReportById,
        generateReport,
        getResumePdf,
        getReports
    };
};

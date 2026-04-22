import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewContext } from "../interview.context";
import { 
    getAllInterviewReports, 
    getInterviewReportById, 
    generateInterviewReport 
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
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (interviewId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch report");
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

    const getResumePdf = (id) => {
        console.log("PDF download triggered for interview id:", id);
        // Placeholder for future implementation
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

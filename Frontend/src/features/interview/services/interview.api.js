import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    withCredentials: true,
});

// Inject token from localStorage as Bearer on every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Interview API Request: ${config.method.toUpperCase()} ${config.url}`, config.data instanceof FormData ? "FormData" : config.data);
    return config;
});

api.interceptors.response.use(
    response => {
        console.log(`Interview API Success: ${response.config.url}`, response.data);
        return response;
    },
    error => {
        const status = error.response?.status;
        // Don't log handled errors like 429 (AI Limit) or 403 (Premium) as "Errors" in console
        if (status !== 429 && status !== 403) {
            console.error(`Interview API Error: ${error.config?.url}`, error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * @description Service to generate interview report base on user description, job Description and resume
 * @param {string} jobDescription - Job description
 * @param {File} resumeFile - Resume file
 * @param {string} selfDescription - Self description
 * @returns {Promise<Object>} - Interview report
 */
export const generateInterviewReport = async ({ jobDescription, resumeFile, selfDescription }) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    // Let Axios set the multipart boundary automatically.
    const response = await api.post("/interview", formData)

    return response.data
}

/**
 * @description service to get interview report by interviewId
 * @param {string} interviewId 
 * @returns {Promise<Object>}
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/interview/${interviewId}`)
    return response.data
}

/**
 * @description service to get all interview reports of user
 * @returns {Promise<Object>}
 */
export const getAllInterviewReports = async () => {
    const response = await api.get(`/interview`)
    return response.data
}

/**
 * @description Service to download tailored resume PDF
 * @param {string} interviewReportId 
 * @returns {Promise<Blob>}
 */
export const downloadResumePdf = async (interviewReportId) => {
    const response = await api.get(`/interview/${interviewReportId}/download`, {
        responseType: "blob"
    })
    return response.data
}
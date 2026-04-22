import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    withCredentials: true,
})

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
    formData.append("resume", resumeFile)

    const response = await api.post("/interview", formData, {
        headers: {
            "content-type": "multipart/form-data"
        }
    })

    return response.data
}

/**
 * @description service to get interview report by interviewId
 * @param {*} interviewId 
 * @returns 
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/interview/${interviewId}`)
    return response.data
}

/**
 * 
 * @returns @description 
 */
export const getAllInterviewReports = async () => {
    const response = await api.get(`/interview`)
    return response.data
}

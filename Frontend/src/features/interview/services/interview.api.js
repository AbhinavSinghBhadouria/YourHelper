import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:3000",
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

    const response = await api.post("/api/interview", formData, {
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
    const response = await api.get(`/api/interview/${interviewId}`)
    return response.data
}

/**
 * @description service to get all interview reports of user
 * @returns 
 */
export const getAllInterviewReports = async () => {
    const response = await api.get(`/api/interview`)
    return response.data
}

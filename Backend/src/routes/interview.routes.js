const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const premiumMiddleware = require("../middlewares/premium.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/
 * @description get all interview reports for the user
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/**
 * @route GET /api/interview/:id
 * @description get interview report by its id
 * @access private
 */
interviewRouter.get("/:id", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/:interviewReportId/download
 * @description generate and download tailored resume PDF (Premium only)
 * @access private
 */
interviewRouter.get("/:interviewReportId/download", authMiddleware.authUser, premiumMiddleware, interviewController.downloadResumePdfController)
module.exports = interviewRouter
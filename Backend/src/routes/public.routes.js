const express = require("express")
const { extractKeywordsFromJD } = require("../services/ai.service")
const publicRouter = express.Router()

/**
 * @route POST /api/public/extract-keywords
 * @description Extract keywords from JD using AI (Public trial feature)
 * @access public
 */
publicRouter.post("/extract-keywords", async (req, res) => {
    try {
        console.log(`Public Keyword Extraction Request received for JD length: ${req.body.jobDescription?.length}`);
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required" });
        }

        const keywords = await extractKeywordsFromJD(jobDescription);
        console.log(`Extracted Keywords: ${keywords.length} found`);
        res.status(200).json({ keywords });
    } catch (error) {
        console.error(`Public Keyword Extraction Error: ${error.message}`);
        res.status(500).json({ message: "Failed to extract keywords" });
    }
});

module.exports = publicRouter;

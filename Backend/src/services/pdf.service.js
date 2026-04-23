
const puppeteer = require('puppeteer');

/**
 * Generates an ATS-ready PDF from report data
 * @param {Object} report - The interview report data
 * @returns {Buffer} - The generated PDF buffer
 */
const generateResumePdf = async (report) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Simple ATS-friendly HTML template
        // In a real app, you'd want a more sophisticated design
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; }
                    h1 { color: #047857; border-bottom: 2px solid #047857; padding-bottom: 10px; }
                    h2 { color: #065f46; margin-top: 25px; }
                    .score-box { background: #ecfdf5; padding: 15px; border-radius: 8px; display: inline-block; }
                    .score { font-size: 24px; font-weight: bold; color: #047857; }
                    .tag { display: inline-block; background: #e5e7eb; padding: 2px 8px; border-radius: 4px; margin-right: 5px; font-size: 12px; }
                    .question { font-weight: bold; margin-top: 15px; }
                    .answer { font-style: italic; color: #4b5563; }
                    .day { margin-bottom: 20px; border-left: 3px solid #10b981; padding-left: 15px; }
                </style>
            </head>
            <body>
                <h1>Interview Preparation Report</h1>
                <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
                
                <div class="score-box">
                    <span>Target Role Match Score:</span>
                    <span class="score">${report.matchScore}%</span>
                </div>

                <h2>Skill Gaps Identified</h2>
                <p>${report.skillGaps.map(gap => `<span class="tag">${gap.skill} (${gap.severity})</span>`).join('')}</p>

                <h2>Roadmap Summary</h2>
                ${report.preparationPlan.map(day => `
                    <div class="day">
                        <h3>Day ${day.day}: ${day.focus}</h3>
                        <ul>
                            ${day.tasks.map(task => `<li>${task}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}

                <h2>Top Technical Questions</h2>
                ${report.technicalQuestions.slice(0, 5).map(q => `
                    <p class="question">${q.question}</p>
                    <p class="answer">${q.answer}</p>
                `).join('')}
            </body>
            </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = { generateResumePdf };

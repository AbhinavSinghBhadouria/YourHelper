/**
 * A comprehensive list of technical skills and keywords for local extraction.
 * This avoids using AI for the public trial feature.
 */
const TECH_SKILLS = [
    // Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "golang", "rust", "swift", "kotlin", "php", "sql", "nosql", "html", "css", "sass", "less", "r", "scala", "perl", "lua",
    
    // Frontend
    "react", "angular", "vue", "next.js", "nextjs", "nuxt", "svelte", "jquery", "bootstrap", "tailwind", "redux", "recoil", "zustand", "context api", "webpack", "babel", "vite",
    
    // Backend & Frameworks
    "node.js", "nodejs", "express", "django", "flask", "fastapi", "spring boot", "laravel", "asp.net", "ruby on rails", "nestjs", "graphql", "apollo", "rest api", "restful", "microservices", "serverless",
    
    // Database
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra", "dynamodb", "mariadb", "sqlite", "oracle", "firebase", "supabase", "prisma", "sequelize", "mongoose",
    
    // DevOps & Cloud
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "jenkins", "github actions", "gitlab ci", "terraform", "ansible", "nginx", "linux", "unix", "ubuntu", "debian", "centos",
    
    // Testing
    "jest", "cypress", "selenium", "mocha", "chai", "playwright", "testing library", "junit", "pytest",
    
    // Others
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "slack", "figma", "adobe xd", "postman", "swagger", "jwt", "oauth", "web3", "blockchain", "ethereum", "solidity", "ai", "machine learning", "ml", "deep learning", "nlp", "data science", "big data", "hadoop", "spark", "kafka", "rabbit mqq", "socket.io",
    
    // Professional/Soft Skills
    "agile", "scrum", "kanban", "leadership", "mentoring", "project management", "stakeholder management", "communication", "problem solving", "critical thinking", "teamwork", "collaboration"
];

/**
 * Extracts technical keywords from a text using a local matching strategy.
 */
function extractKeywordsLocally(text) {
    if (!text) return [];

    const cleanText = text.toLowerCase().replace(/[^a-z0-9+#\s]/g, " ");
    const words = cleanText.split(/\s+/);
    
    // Use a Set for unique matches
    const foundKeywords = new Set();
    
    // 1. Direct word matching
    words.forEach(word => {
        if (TECH_SKILLS.includes(word)) {
            foundKeywords.add(word);
        }
    });

    // 2. Phrase matching (e.g., "react js", "node js", "spring boot")
    TECH_SKILLS.forEach(skill => {
        if (skill.includes(" ") && cleanText.includes(skill)) {
            foundKeywords.add(skill);
        }
    });

    // Format back to capitalized version for UI
    return Array.from(foundKeywords).map(kw => {
        if (kw.length <= 3) return kw.toUpperCase(); // e.g., AWS, PHP, CSS
        return kw.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    });
}

module.exports = { extractKeywordsLocally };

const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const userModel = require("../models/user.model")
async function authUser(req, res, next) {
    // Support both cookie-based and Bearer token auth (needed for cross-domain deployments)
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") 
                    ? req.headers.authorization.split(" ")[1] 
                    : null);

    if (!token) {
        return res.status(401).json({
            message: "Token is not provided"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Fetch full user to ensure we have latest premium/plan status
        const user = await userModel.findById(decoded.id).select("-password")
        
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" })
        }

        // Auto-expire trial access and normalize account back to free plan.
        if (user.trialEndsAt && new Date(user.trialEndsAt) <= new Date() && user.isPremium) {
            user.isPremium = false
            user.plan = "free"
            user.trialStartedAt = null
            user.trialEndsAt = null
            await user.save()
        }

        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

module.exports = { authUser }
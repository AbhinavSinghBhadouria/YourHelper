
/**
 * Middleware to restrict access to premium features
 * Checks if the user has an active premium subscription
 */
const premiumMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    console.log(`Premium Check: User ${req.user.username}, Plan: ${req.user.plan}, isPremium: ${req.user.isPremium}`);

    if (!req.user.isPremium) {
        return res.status(403).json({
            message: "This is a premium feature. Please upgrade your plan to access it.",
            premiumRequired: true
        });
    }

    // Optional: Check if subscription has expired
    if (req.user.subscriptionExpires && new Date() > new Date(req.user.subscriptionExpires)) {
        return res.status(403).json({
            message: "Your premium subscription has expired. Please renew to continue.",
            subscriptionExpired: true
        });
    }

    next();
};

module.exports = premiumMiddleware;

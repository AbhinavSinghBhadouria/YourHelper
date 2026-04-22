const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const tokenBlacklistModel = require("../models/blacklist.model")
const { OAuth2Client } = require("google-auth-library")

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


/**
 * @name registerUserController
 * @description register a new user
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !password || !email) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExists) {
            if (isUserAlreadyExists.username == username) {
                return res.status(400).json({
                    message: `${username} already exists`
                })
            }
            if (isUserAlreadyExists.email == email) {
                return res.status(400).json({
                    message: `${email} already exists`
                })
            }
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token)

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @name loginUserController
 * @description login a user with email and password
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        // Google-only users have no password
        if (!user.password) {
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please login with Google."
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token)

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @name logoutUserController
 * @description clear token from cookie and blacklist it
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        res.status(200).json({
            message: "Logged out successfully"
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access Private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @name googleAuthController
 * @description Verify Google token, find or create user, return own JWT via cookie
 * @access Public
 */
async function googleAuthController(req, res) {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ message: "Google token is required" })
        }

        // 1. Verify the token Google sent is genuine
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const { email, name, picture, sub: googleId } = ticket.getPayload()

        let user = await userModel.findOne({ email })

        if (!user) {
            // Try to find a unique username: use display name → email prefix → add suffix
            let username = name
            let existingUser = await userModel.findOne({ username })

            if (existingUser) {
                // Fall back to email prefix (part before @)
                username = email.split("@")[0]
                existingUser = await userModel.findOne({ username })

                if (existingUser) {
                    // Append short random suffix to guarantee uniqueness
                    username = `${email.split("@")[0]}_${Math.random().toString(36).slice(2, 6)}`
                }
            }

            user = await userModel.create({
                username,
                email,
                picture,
                googleId,
                password: null,
                authProvider: "google"
            })
        } else {
            if (!user.googleId) {
                user.googleId = googleId
                await user.save()
            }
        }

        const jwtToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", jwtToken)

        res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.error("Google auth error:", error.message)
        res.status(500).json({ message: "Google authentication failed", error: error.message })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleAuthController
}
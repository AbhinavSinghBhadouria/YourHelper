const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const tokenBlacklistModel = require("../models/blacklist.model")
/**
 * 
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
            {
                id: user._id, username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token) // (kept as-is)

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
            message: "user logged in successfully",
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
 */
async function logoutUserController(req, res) {
    try { // ✅ FIX: added error handling
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        // ✅ FIX: missing response
        res.status(200).json({
            message: "Logged out successfully"
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

/**
 * @name getMeController
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

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
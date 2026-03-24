const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
/**
 * 
 * @name registerUserController 
 * @description register a new user , expects username, email, and password in the request
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body

    if (!username || !password || !email) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]          // it is used like if any user exists with the given email or username then return it
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
    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @description login a user , expects username and password in the request
 * @access Public
 */
async function loginUserController(req, res) {
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
}
module.exports = {
    registerUserController,
    loginUserController
}

const express = require('express')
const authController = require("../controllers/auth.controller")
const authRouter = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")

/**
 * @route POST /api/auth/register
 * @description Register a new user,
 * @access Public
 */
authRouter.post("/register", authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login a user with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
authRouter.get("/logout", authController.logoutUserController)

/** 
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


/**
 * @route POST /api/auth/google
 * @description Verify Google token, find or create user, return own JWT
 * @access Public
 */
authRouter.post("/google", authController.googleAuthController)


/**
 * @route PUT /api/auth/upgrade
 * @description Upgrade user to Pro plan
 * @access Private
 */
authRouter.put("/upgrade", authMiddleware.authUser, authController.upgradeUserController)


module.exports = authRouter
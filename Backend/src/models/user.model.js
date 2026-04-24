const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () { return !this.googleId; }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: {
        type: String
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
    },
    stripeCustomerId: {
        type: String
    },
    trialStartedAt: {
        type: Date
    },
    trialEndsAt: {
        type: Date
    }
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;

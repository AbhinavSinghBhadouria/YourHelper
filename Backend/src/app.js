const express = require("express")
const cors = require("cors")

const app = express()
console.log("YourHelper Backend App Initializing...");

// Allow Google Sign-In popup to postMessage back to your page
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
    next()
})

app.use(express.json())
app.use(require('cookie-parser')())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))



const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const publicRouter = require("./routes/public.routes")

/* using all the routes here */
/* here what i did is if any request starts with /api/auth then it will forward it to authrouter*/
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/public", publicRouter)


// in this file firstly we have created a server 
module.exports = app;
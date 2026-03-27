const express = require("express")

const app = express()

app.use(express.json())
app.use(require('cookie-parser')())
const authRouter = require("./routes/auth.routes")

/* using all the routes here */
/* here what i did is if any request starts with /api/auth then it will forward it to authrouter*/
app.use("/api/auth", authRouter)


// in this file firstly we have created a server 
module.exports = app;
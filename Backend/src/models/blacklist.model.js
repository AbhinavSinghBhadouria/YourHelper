// when the user request the server for login ,
//  the server assigns a token to the user which is stored 
// in the cookie of the user 
// when the user logs out , the token is blacklisted
// in easy way what most of us do is just remove the token from the cookie of the user but 
// suppose some anonymous person has the token of the user then he can access the 
// protected routes so to prevent this we use blacklist otherwise the anonymous person can
// make unauthorized use to the server on behalf of the legal user...


const mongoose = require("mongoose")

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required to be added in blacklist" ]
    },
    },{
    timestamps: true
    }
)
const tokenBlacklistModel=mongoose.model("blacklistToken",blacklistTokenSchema)

module.exports=tokenBlacklistModel

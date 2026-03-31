const multer=require("multer")

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:3*1024*1024 //filesize of 3 mb is allowed
    }
})

module.exports=upload
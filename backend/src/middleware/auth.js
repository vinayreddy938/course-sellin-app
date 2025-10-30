const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../model/user.schema");

const auth = async(req,res,next)=>{
    try{  
        console.log("auth")
        const {token} = req.cookies  
        const  isJwtValid = jwt.verify(token,process.env.SECRET_KEY);
        if(!isJwtValid){
            return res.status(400).json({message:"token expired"})

        }
        const user = await User.findOne({_id:isJwtValid._id});
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        req.user = user;
        next();



    }catch(err){
        res.status(500).json({message:err.message})
    }
}

const RoleBased = (allowedRole)=>{
    return(req,res,next)=>{ 
        console.log(req.user.role)
        if(req.user.role != allowedRole){
             return res.status(403).json({ message: "Access denied: insufficient permissions" })
        }
        next()

    }
}
module.exports = {auth,RoleBased};
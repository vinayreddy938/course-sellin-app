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

const RoleBased = (...allowedRoles) => {
    return (req, res, next) => { 
        if (!req.user) {
            return res.status(401).json({ 
                message: "Authentication required" 
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
            });
        }
        
        next();
    };
};
module.exports = {auth,RoleBased};
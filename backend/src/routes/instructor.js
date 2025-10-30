const {Router} = require("express");
const User = require("../model/user.schema");
const instructorRouter = Router();
const validateUserData = require("../utils/helper")
const bcrypt = require("bcrypt")
instructorRouter.post("/signup",async(req,res)=>{
    try{ 
            validateUserData(req,res); 
            const {firstName,lastName,email,password} = req.body;
            const isUserFound =  await User.findOne({email});
            if(isUserFound){
                return res.status(400).json({message:"user already exist"})
            }
            const passwordHash = await bcrypt.hash(password,10);
            const user = new User({firstName,lastName,email,password:passwordHash,role:"instructor"});
            await  user.save();
        
            return res.status(201).json({message:"User Registered Sucessfully"});
            
            
    
        }catch(err){
            res.status(500).json({message:err.message})
        }

})

module.exports = instructorRouter

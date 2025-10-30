const {Router} = require("express");
const userRouter = Router();
const validateUserData = require("../utils/helper")
const bcrypt = require("bcrypt");
const User = require("../model/user.schema")
const jwt = require("jsonwebtoken")
userRouter.post("/signup",async(req,res)=>{
    try{ 
        validateUserData(req,res); 
        const {firstName,lastName,email,password} = req.body;
        const isUserFound =  await User.findOne({email});
        if(isUserFound){
            return res.status(400).json({message:"user already exist"})
        }
        const passwordHash = await bcrypt.hash(password,10);
        const user = new User({firstName,lastName,email,password:passwordHash});
        await  user.save();
    
        return res.status(201).json({message:"User Registered Sucessfully"});
        
        

    }catch(err){
        res.status(500).json({message:err.message})
    }
})
userRouter.post("/login",async(req,res)=>{
    try{
        if(req.body== undefined){
            return res.status(401).json({message:"please provie emailId and password"})
        }
       
        const{email,password} = req.body;
        if(!email){
            return res.status(401).json({message:"please must provie email"})
        }
        if(!password){
            return res.status(401).json({message:"please must provide password"})
        }
        const user = await User.findOne({email});
        if(user){
            const token =  jwt.sign({_id:user._id},"SECRETKEY");
            res.cookie("token",token);
            return res.status(200).json({data:user})
        }else{
            return res.status(404).json({message:"user not registered"})
        }

    }catch(err){
         res.status(500).json({message:err.message})

    }

})

module.exports = userRouter;
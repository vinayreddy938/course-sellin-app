const {Router} = require("express");
const User = require("../model/user.schema");
const instructorRouter = Router();
const validateUserData = require("../utils/helper")
const bcrypt = require("bcrypt")
const  {auth,RoleBased} = require("../middleware/auth")
const  Course = require("../model/course.schema");
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
instructorRouter.post("/add/course",auth,RoleBased("instructor"),async(req,res)=>{
    try{
        const {courseName,startDate,endDate,instructor,price,sections,description} = req.body;
        if(!courseName){
            return res.status(400).json({message:"course name requires"});
        }
        if(!price){
            return res.status(400).json({message:"price required"})
        }
        if(!description){
            return res.status(400).json({message:"description required"})
        }
       
        const course = new Course({courseName,price,description,instructor:req.user._id});
        if(startDate!=null){
            course.startDate = startDate;
        }
        if(endDate!=null){
            course.endDate = endDate;
        }
        if(sections!=null){
            course.sections = sections;
        }
        const savedCourse = await course.save();
        return res.status(200).json({data:savedCourse});
        
 
    }catch(err){
        res.status(500).json({message:err.message})
    }
})
instructorRouter.patch("/edit/course/:id",auth,RoleBased("instructor"),async(req,res)=>{
    try{
        validateUserData.validateFileds(req,res);
        const {courseName,startDate,endDate,instructor,price,sections,description} = req.body; 
        const {id} = req.params;
        const currentInstructor = req.user;
        const course = await Course.findOne({instructor:currentInstructor._id ,_id:id});
        if(!course){
            return res.status(404).json({message:"np courses found"})
        }
          if(courseName!=null){
          course.courseName = courseName;
        }
        if(price!=null){
            course.price = price;
           
        }
        if(description!=null){
            course.description = description;
        }
       
        if(startDate!=null){
            course.startDate = startDate;
        }
        if(endDate!=null){
            course.endDate = endDate;
        }
        if(sections!=null){
            course.sections = sections;
        }
       const updatedCourse =  await course.save();
       return res.status(200).json({data:{updatedCourse}})
        

    }catch(err){
        return res.status(500).json({message:err.message})
    }

})

module.exports = instructorRouter

const {Router, json} = require("express");
const userRouter = Router();
const {validateUserData} = require("../utils/helper")
const bcrypt = require("bcrypt");
const User = require("../model/user.schema")
const jwt = require("jsonwebtoken");
const { RoleBased ,auth} = require("../middleware/auth");
const Course = require("../model/course.schema")
const Enrollment = require("../model/enrollment.schema")
const Review = require("../model/review.schema")
const upload = require('../middleware/upload');
const removeFromCloudinary = require("../utils/deleteFromCloudinary")
const uploadToCloudinary = require("../utils/uploadToCloudinary")

require("dotenv").config();
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
        if(!user){
             return res.status(404).json({message:"user not registered"})
        }
        const isPasswordValid =await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid Credentials"})
        }
        
            const token =  jwt.sign({_id:user._id},process.env.SECRET_KEY);
            res.cookie("token",token);
            return res.status(200).json({data:user})
        

    }catch(err){
         res.status(500).json({message:err.message})

    }

})
userRouter.get("/courses",auth,RoleBased("user"),async(req,res)=>{ 
    try{
        const courses = await Course.find().select("_id courseName price description thumbnail instructor")
      .populate("instructor", "firstName lastName email"); 
        if(courses.length==0){
         return   res.status(404).json({message:"no courses found"})

        } 
        return res.status(200).json({data:{courses}})

    }catch(err){
        res.status(500).json({message:err.message})
    }

}) 
userRouter.get("/view-course/:courseId",auth,RoleBased("user"),async(req,res)=>{
    try{   
        const{courseId} = req.params;
        const course = await Course.findById(courseId).select("courseName description price sections instructor")
           .populate("instructor", "firstName lastName email profileImage");
        if(!course){
            return res.status(404).json({message:"course details not found"})
        }
        return res.status(200).json({data:course})
       

    }catch(err){
        return res.status(500).json({message:err.message})
    }
})  
userRouter.post("/checkout/:courseId",auth,RoleBased("user"),async(req,res)=>{
    try{
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ message: "Course not found" })
    const isAlreadyEnrolled = await Enrollment.findOne({studentId: req.user._id,instructorId: course.instructor,status: "completed"}); 
     if(isAlreadyEnrolled){
        return res.status(400).json({message:"You are already enrolled"})
     }
    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      instructorId: course.instructor,
      courseId: course._id,
      amount: course.price,
      paymentId: "fake_phonepe_txn_" + Date.now(),
      status: "completed", 
    });
    res.status(200).json({message:"payment sucessfully",enrollment});
  }catch(err){
    res.status(500).json({message:err.message})
  }


})
userRouter.get("/course-content/:courseId",auth,RoleBased("user"),async(req,res)=>{
    try{
        //checking user is in enrollment 
        const{courseId} = req.params;
        const enrollment = await Enrollment.findOne({courseId,studentId:req.user._id,status:"completed"}) 
        if(!enrollment){
            return res.status(403).json({ message: "Access denied: You must enroll in this course to view content.",})
        }
          const course = await Course.findById(courseId)
        .select("courseName description sections instructor")
        .populate("instructor", "firstName lastName email profileImage");

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({ data: course });

    }catch(err){
        return res.status(500).json({message:err.message})
    }

})
userRouter.get("/profile",auth,RoleBased("user"),async(req,res)=>{
  try{ 
    const{firstName,lastName,email,bio,profileImage} = req.user;

        
    return res.status(200).json({firstName,lastName,email,bio,profileImage });

  }catch(err){
    return res.status(500).json({message:err.message})

  }
}) 
userRouter.post("/logout",auth,(req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
});
userRouter.get("/my-enrollments",auth,RoleBased("user"),async(req,res)=>{
    try{
        const enrollments = await Enrollment.find({studentId:req.user._id,status:"completed"}).populate("courseId", "courseName instructor thumbnail price")
      .populate("instructorId", "firstName lastName email");
;
        if(enrollments.length==0){
            return res.status(404).json({message:"You have are not enrolled in any courses"})
        } 
         return res.status(200).json({ data: enrollments });
        
    }catch(err){
        res.status(500).json({message:err.message})
    }
}) 
userRouter.patch("/profile",auth,async(req,res)=>{
    try{
        validateFileds(req.body);
        const{firstName,lastName,bio} = req.body;
        const user = req.user;
        if (!firstName && !lastName && !bio) {
              return res.status(400).json({ message: "No fields provided to update" });
         } 

        if(firstName!=null){
            user.firstName = firstName

        }
        if(lastName!=null){
            user.lastName = lastName
        }
        if(bio!=null){
            user.bio = bio;
        }
        await user.save();
        return res.status(200).json({message:"profile updated successfully",data:user})

    }catch(err){
        res.status(500).json({message:err.message})
    }

}) 
userRouter.patch("/change-profile",auth,upload.single("profileImg"),async(req,res)=>{
    try{ 
        const file = req.file;
        const user = req.user;
        if(!file){
            return res.status(404).json({message:"no image selected"});
        }
        if(user.publicId){
            await removeFromCloudinary(user.publicId,"image");
        } 
       const uploadItem =  await uploadToCloudinary(file.buffer,"profile-images");
       user.profileImage = uploadItem.secure_url;
       user.publicId = uploadItem.public_id; 
       await user.save();
       return res.json({message:"profile updated sucessfully" , data:user})


    }catch(err){
        return res.status(500).json({message:err.message})
    }
})
userRouter.get("/email-exist",async(req,res)=>{ 
    try{ 
        const {email} = req.query;
          if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
        const user = await User.findOne({email});
        if(user){
         return    res.status(400).json({message:"email id already exist"})

        }
        res.status(200).json({message:"ok"})

    }catch(err){
        res.status(500).json({message:err.message})
    }

})






module.exports = userRouter;
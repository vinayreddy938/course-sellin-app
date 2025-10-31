const {Router} = require("express");
const User = require("../model/user.schema");
const instructorRouter = Router();
const validateUserData = require("../utils/helper")
const bcrypt = require("bcrypt")
const  {auth,RoleBased} = require("../middleware/auth")
const  Course = require("../model/course.schema");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/uploadToCloudinary")
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
instructorRouter.post("/add/course",auth,RoleBased("instructor"),upload.fields([
    { name: "coverPhoto", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),async(req,res)=>{
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

        const coverResult = req.files.coverPhoto
        ? await uploadToCloudinary(req.files.coverPhoto[0].buffer, "course_covers")
        : null;  
        const thumbResult = req.files.thumbnail
        ? await uploadToCloudinary(req.files.thumbnail[0].buffer, "course_thumbnails")
        : null;

       
        if(startDate!=null){
            course.startDate = startDate;
        }
        if(endDate!=null){
            course.endDate = endDate;
        }
        if(sections!=null){
            course.sections = sections;
        }
        console.log(thumbResult.public_id)
          const course = new Course({
        courseName,
        price,
        description,
        startDate,
        endDate,
        instructor: req.user._id,
        coverPhoto: coverResult?.secure_url,
        coverPhotoPublicId:coverResult.public_id,
        thumbnail: thumbResult?.secure_url,
        thumbnailPublicId:thumbResult.public_id
      });
        const savedCourse = await course.save();

        return res.status(200).json({data:savedCourse});
        
 
    }catch(err){
        res.status(500).json({message:err.message})
    }
})
instructorRouter.post("/course/:courseId/section/:sectionIndex/lesson/:lessonIndex/video",auth,RoleBased("instructor"),upload.single("video"),async(req,res)=>{ 
    try{
        const { courseId, sectionIndex, lessonIndex } = req.params;  
         const file = req.file; 
         if (!file) {
        return res.status(400).json({ message: "No video file provided" });
        }
        const course = await Course.findById(courseId);
         if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
       const uploadResult = await uploadToCloudinary(
        file.buffer,
        "course_videos",
        "video"
      );
      course.sections[sectionIndex].lessons[lessonIndex].videoUrl =
        uploadResult.secure_url; 
        course.sections[sectionIndex].lessons[lessonIndex].videoPublicId = upload.public_id;
          await course.save(); 
          return res.status(200).json({message:"Your video uploaded SuceessFully",
            videoUrl: uploadResult.secure_url
          });

    }catch(err){
        res.status(500).json({ message: err.message });

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
instructorRouter.get("/my-courses",auth,RoleBased("instructor"),async(req,res)=>{
  try{ 
      const currentUser = req.user;
      const courses = await Course.find({instructor:currentUser._id}); 
      if(courses.length ===0){
      return res.status(404).json({message:"no courses"})

      } 
      return res.status(200).json({data:courses});



  }catch(err){
      return res.status(500).json({message:err.message});
  }
})



module.exports = instructorRouter

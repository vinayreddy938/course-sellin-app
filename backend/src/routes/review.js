const { Router } = require('express');
const commentRouter = Router();
const Course = require('../model/course.schema');
const Enrollment = require('../model/enrollment.schema');
const Review = require('../model/review.schema');
const { auth,RoleBased } = require('../middleware/auth');
const mongoose = require("mongoose")
commentRouter.post('/:courseId/review',auth,RoleBased('user'),async (req, res) => {
    try {
      const { courseId } = req.params;
      const { comment, rating } = req.body;
      if (!rating || !comment) {
        return res
          .status(400)
          .json({ message: 'Rating and comment are required' });
      }
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: 'Rating must be between 1 and 5' });
      }
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ message: 'course not found' });
      }
        const isEnrolled = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: courseId,
      });
      if (!isEnrolled) {
        return res
          .status(404)
          .json({ message: 'You are not enrolled the course' });
      }

      const existingReview = await Review.findOne({
        courseId,
        studentId: req.user._id,
      });
      if (existingReview) {
        return res.status(400).json({ message: 'You already gave a review' });
      }
      const review = new Review({
        rating,
        comment,
        studentId: req.user._id,
        courseId,
      });
      await review.save();
      return res.status(200).json({ message: 'Review added successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);
commentRouter.get('/:courseId/reviews', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    //if user didnt give query parameters
    let { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit; //if page=1 means it will take first 10 documents skip = (1-1)*10 =0 skip docuemts
    // page=2 skip = (2-1)*10 = 10 skip first 10 documents

    const review = 
      await Review.find({ courseId }).populate('studentId','firstName lastName profileImage').sort({ createdAt: -1 }).skip(skip).limit(limit);  
    const reviewCount = await Review.countDocuments({courseId}); 
    const avgRating = await Review.aggregate([
        {$match:{courseId:new mongoose.Types.ObjectId(courseId)}},
        {$group:{_id: null,avgRating:{ $avg: "$rating" } }}
    ])
     return res.status(200).json({ 
            data: review,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                reviewCount,
                totalPages: Math.ceil(reviewCount / limit)
            },
            averageRating: avgRating[0]?.avgRating || 0
        });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
commentRouter.patch("/:courseId/review",auth,RoleBased("user","admin"),async(req,res)=>{
    try{
        const{courseId} = req.params;
        const { rating, comment } = req.body;
        const review = await Review.findOne({ courseId, studentId: req.user._id}); 
        if (!rating && !comment) {
           return res.status(400).json({ message: "Nothing to update" });
          }
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating must be between 1 and 5" });
            }
           if (rating) review.rating = rating;
          if (comment) review.comment = comment;

        await review.save(); 
        return res.status(201).json({message:"updated sucessfully",
             data: review 
        })

    }catch(err){
        return res.status(500).json({message:err.message})
    }
}) 
commentRouter.delete("/:courseId/review",auth,RoleBased("user","admin"),async(req,res)=>{
    try{
        const {courseId} = req.params;
        const review = await Review.findOne({courseId,studentId:req.user._id});
        if(!review){
             return res.status(404).json({ message: "Review not found" });

        }
         await review.deleteOne();

        return res.status(200).json({ message: "Review deleted successfully" });

    }catch(err){
        return res.status(500).json({message:err.message})
    }
}) 


module.exports = commentRouter;


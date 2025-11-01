const{Schema,model} = require("mongoose");
const instructorRouter = require("../routes/instructor");
const ObjectId = Schema.ObjectId;
const reviewSchema = new Schema({
    studentId:{
        type:ObjectId,
        ref:"User",
        required: true
    },
    courseId:{
        type:ObjectId,
        ref:"Course",
        required: true
    },
    rating:{
        type:Number,
         min: 1,
        max: 5,
        default:1
    },
    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    }

},{timestamps:true})


reviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = model("review",reviewSchema);
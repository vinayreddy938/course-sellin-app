const {Schema,model} = require("mongoose");
const ObjectId = Schema.ObjectId;
const UserSchema = new Schema({
    firstName:{
        type:String,
        required :true,
        trim:true,
        minlength: 3,
        maxlength: 100,
    },
    lastName:{
        type:String,
        trim:true,
        minlength: 3,
        maxlength: 100,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        minlength: 3,
        maxlength: 100

    },
    password:{
        type:String,
        required:true,
        minlength:6,
        maxlength:120,

    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    bio:{
        type:String,
        minlength:3,
        maxlength:200,
        default : "Hey I Am Learner"
    },
    profileImage: {
      type: String, // optional (Cloudinary URL)
      default: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
    },
    enrolledCourses:[{
        type:String,
        courseId: {
          type: ObjectId,
          ref: "Course",
        },
        progress: {
          type: Number,
          default: 0,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        }


    }]


},{ timestamps: true })



module.exports = model("user",UserSchema);
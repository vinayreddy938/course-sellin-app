const {Schema,model} = require("mongoose");
const ObjectId = Schema.ObjectId;
const enrollmentScehma = new Schema({ 
    studentId:{
        type:ObjectId,
        ref: "User",
        required: true,
    },
    instructorId:{
        type:ObjectId,
        ref: "Instructor",
        required: true,
    },
    courseId:{
        type:ObjectId,
        ref: "Course",
        required: true,

    },
     paymentId: String,
     status:{
        type:String,
        enum:["pending", "completed", "failed"],
        default:"pending"
     },
     amount:{
        type:Number
     }
    

},{ timestamps: true })

module.exports = model("enrollment",enrollmentScehma)
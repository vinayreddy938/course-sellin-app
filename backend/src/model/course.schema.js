const {Schema,model} = require("mongoose");
const ObjectId = Schema.ObjectId;
const courseSchema = new Schema({
    courseName:{
        type:String,
        required:true
    },
     startDate: Date,
     endDate: Date,
  instructor: {
    type: ObjectId,
    ref: "Instructor",
    required: true,
  },
  thumbnail: String, 
    thumbnailPublicId: String, 
    coverPhoto: String,
    coverPhotoPublicId: String,
   price: {
    type: Number,
    required: true,
    default: 0 
  },
  description: {
    type: String,
    required: true,
    minlength: 50,
    maxlength:500 
  },
  sections:[
    {
        title:String,
        lessons:[
            {
                title: { type: String, required: true },
                videoUrl:{type:String},
                videoPublicId:String,

                cheatSheetUrl:{type:String},
                cheatSheetPublicId:String,
                duration: { type: Number }
            }
        ]
    }
  ]
},{timestamps:true}) 

module.exports = model("course",courseSchema);
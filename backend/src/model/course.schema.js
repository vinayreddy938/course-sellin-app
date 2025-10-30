const {Schema,model} = require("mongoose");
const ObjectId = Schema.ObjectId;
const courseSchema = new Schema({
    courseName:{
        name:String,
        required:true
    },
     startDate: Date,
  endDate: Date,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  }
  sections:[
    {
        title:String,
        lessons:[
            {
                title: { type: String, required: true },
                videoUrl:{type:String},
                cheatSheetUrl:{type:String},
                duration: { type: Number }
            }
        ]
    }
  ]
})
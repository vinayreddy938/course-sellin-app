const express = require("express");
const app=  express();
const db = require("./config/db")
const userRouter = require("./routes/user")
const instructorRouter = require("./routes/instructor")
const cookieParser = require("cookie-parser");
const reviewRouter = require("./routes/review") 
const cors = require("cors")
app.use(cors({
     origin:true,
    credentials: true  // Allow cookies
}));
app.use(cookieParser())
app.use(express.json())

app.use("/api/v1/user",userRouter);
app.use("/api/v1/instructor",instructorRouter);
app.use("/api/v1/courses",reviewRouter)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});



db().then(()=>{
    app.listen(4000,()=>[
        console.log("server started")
    ])
}).catch((err)=>console.log(err))
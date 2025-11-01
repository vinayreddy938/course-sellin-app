const express = require("express");
const app=  express();
const db = require("./config/db")
const userRouter = require("./routes/user")
const instructorRouter = require("./routes/instructor")
const cookieParser = require("cookie-parser");
const reviewRouter = require("./routes/review")
app.use(cookieParser())
app.use(express.json())

app.use("/api/v1/user",userRouter);
app.use("/api/v1/instructor",instructorRouter);
app.use("/api/v1/courses",reviewRouter)



db().then(()=>{
    app.listen(4000,()=>[
        console.log("server started")
    ])
}).catch((err)=>console.log(err))
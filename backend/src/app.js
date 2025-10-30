const express = require("express");
const app=  express();
const db = require("./config/db")
const userRouter = require("./routes/user")
const instructorRouter = require("./routes/instructor")
app.use(express.json())

app.use("/api/v1/user",userRouter);
app.use("/api/v1/instructor",instructorRouter);



db().then(()=>{
    app.listen(4000,()=>[
        console.log("server started")
    ])
}).catch((err)=>console.log(err))
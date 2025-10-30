const express = require("express");
const app=  express();
const db = require("./config/db")
const useRouter = require("./routes/user")
app.use(express.json())

app.use("/api/v1/user",useRouter);



db().then(()=>{
    app.listen(4000,()=>[
        console.log("server started")
    ])
}).catch((err)=>console.log(err))

const User = require("../model/user.schema")
const validate = require("validator");
const validateUserData = (req,res)=>{
    const requiredKeys = new Set(Object.keys(User.schema.paths));
    const validkeys = Object.keys(req.body).every((key)=>requiredKeys.has(key)); 
    if(!validkeys){
        return res.status(402).json({message:"Invalid Keys"})
    }
    const {firstName,lastName,email,password,bio} = req.body;
    if(!firstName){
        return res.status(400).json({message:"name must be present"});
    }

    if(!validate.isEmail(email)){
        return res.status(400).json({message:"Invalid email"});
    }
    if(!password){
        return res.status(401).json({message:"password must be provide"})
    }
    if(!validate.isStrongPassword(password)){
        return res.status(400).json({message:"password must be strong"})

    }

}
module.exports = validateUserData;
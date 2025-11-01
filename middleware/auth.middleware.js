const jwt=require('jsonwebtoken')
const usermodel=require("../user.model.js")
 const verifyjwt=async(req,res,next)=>{
  try{
 console.log(req.cookies)
    const token=req.cookies?.accesstoken || req.headers["Authorization"]?.replace("Bearer"," ")
console.log("jwt on")
  console.log(token)
    if(!token){
        throw new Error("Unauthorized user ")
    }
    const decodedtoken=await jwt.verify(token,process.env.access_token)

    if(!decodedtoken){
        return res.status(401).json({error:"Token is not matching or verifying  "})
    }
    const finduser=await usermodel.findById(decodedtoken?._id).select("-pass -password -refreshToken")

    if(!finduser){
        return res.status(500).json({message:"invalid access token"})
    }
    req.user=finduser
    console.log(finduser)
    next();
  }
    catch (error) {
        return res.status(500).json({message:error})
    }
}
module.exports=verifyjwt

const mongoose=require('mongoose')

const Password=mongoose.Schema({
    Index:Number,
    Web:String,
    User:String,
    Pass:String,
})
const Pass=mongoose.model("Password",Password);
module.exports=Pass;
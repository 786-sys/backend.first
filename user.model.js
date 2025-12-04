const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()
const userSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pass: [{
        web: { type: String },
        username: { type: String },
        password: { type: String }
    }],
    chats:[{
        ques:{type:String},
        ans:{type:String}
    }],
    refreshToken:{
        type:String
    }
})
userSchema.pre("save", async function (next) {
    console.log("pre ")
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 12)
    next();
})

// custom methods 
userSchema.methods.ispasswordcorrect = async function (password) {
    console.log(password)
    console.log(this.password)
    return await bcrypt.compare(password, this.password)
}

// token generate 
// sign in token
userSchema.methods.generateAccessToken = async function () {
    console.log(process.env.access_token)
    return jwt.sign({
        //payloads
        _id: this._id,
        user: this.user,
    },
        // generate token
        process.env.access_token,
        //expiry token
        {
            expiresIn: process.env.expiry_access
        }
    )

}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        //payloads
        _id: this._id
    },
        // generate token
        process.env.refresh_token,
        //expiry token
        {
            expiresIn: process.env.expiry_refresh
        }

    )
}
const user = mongoose.model("user", userSchema);
module.exports = user;
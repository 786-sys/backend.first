const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const usermodel = require('./user.model.js')
const cookie = require('cookie-parser')
const verifyjwt = require('./middleware/auth.middleware.js')
const port = 5071
const app = express()

dotenv.config()
app.use(express.json())

app.use(cookie())
app.use(cors({

    origin: [
        "https://your-frontend-app.netlify.app",
        "http://localhost:5173" ],
        credentials: true
}));

Main().catch(err => console.log(err))

async function Main() {
    let a = await mongoose.connect("mongodb://localhost:27017/admin")
}
Main();
app.get('/', (req, res) => {
    res.send("hello world")
})
app.post('/user/signup', async (req, res) => {
    const { user, password } = req.body
    if (!user || !password) {
        res.status(401).json({ error: "Filled both the field" })
    }
    const userExist = await usermodel.findOne({ user })
    if (userExist) {
        return res.status(400).json({ message: "already exist the user " })
    }
    const USER = new usermodel({
        user: user,
        password: password
    })
    await USER.save()
    const SignUpUser = await usermodel.findById({ _id: USER._id }).select("-password")
    res.status(200).json({ message: "register", user: SignUpUser })
})

const generateaccessrefreshtoken = async (id) => {

    const user = await usermodel.findById(id)
    const accesstoken = await user.generateAccessToken()
    const refreshtoken = await user.generateRefreshToken()
    user.refreshToken = refreshtoken
    await user.save({ validateBeforeSave: false })

    return { accesstoken, refreshtoken }
}

app.post('/user/signin', async (req, res) => {
    const { user, password } = req.body
    if (!user || !password) {
        res.status(401).json({ error: "Filled both the field" })
    }
    const userExist = await usermodel.findOne({ user })
    if (!userExist) {
        return res.status(400).json({ message: "User Dont exist , register first " })
    }
    const iscorrectpassword = await userExist.ispasswordcorrect(password)

    if (!iscorrectpassword) {
        return res.status(401).json({ message: "incorrect password" })
    }
    const { accesstoken, refreshtoken } = await generateaccessrefreshtoken(userExist._id);

    const options = {
        httpOnly: true,
        secure: false,   // must be false for http://
        sameSite: "lax" // allows cross-site (different port)
    };


    const SigninUser = await usermodel.findById({ _id: userExist._id }).select("-password -refreshToken -pass")
    res.status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
        .json({ message: "U hvae been successfully loged in", user: SigninUser })
})
app.post('/logout', verifyjwt, async (req, res) => {
    console.log(req.user)
    const user = await usermodel.findById(req.user)
    if (!user) {
        return res.status(401).json({ message: "unauthorized user " })
    }
    const updating = await usermodel.findByIdAndUpdate(user._id,
        {
            $set: { refreshToken: undefined }
        })
    const options = {
        httpOnly: true,
        secure: false,   // must be false for http://
        sameSite: "lax" // allows cross-site (different port)
    };
    res.status(200)
        .clearCookie("accesstoken", options)
        .clearCookie("refreshtoken", options)
        .json({ message: "U have been successfully loged out " })
})

app.post('/submit', verifyjwt, async (req, res) => {
    console.log("submitted");

    const reqUser = await usermodel.findById(req.user?._id);
    console.log(req.user)

    if (!reqUser) {
        return res.status(401).json({ message: "unauthorized user " })
    }
    let web = req.body.WEB
    let user = req.body.USER
    let pass = req.body.PASS
    console.log(web, user, pass)
    try {
        const arr = {
            web: web,
            username: user,
            password: pass
        }
        // await usermodel.findByIdAndUpdate(reqUser?._id, {
        //     $set: {
        //         pass: [...arr]
        //     }
        // })

        let passArray = reqUser.pass
        passArray = [...passArray, arr]
        reqUser.pass = passArray
        console.log(reqUser.pass)
        await reqUser.save({ validateBeforeSave: false })
    } catch (ERR) {
        console.error("not saved data " + ERR);
        //  res.json({mess:"error is at backend posing"})
    }
    res.json({ mess: "your data has been saved in Database" })
})

app.delete('/delete', verifyjwt, async (req, res) => {
    console.log(req.user)
    if (!req.user) {
        return res.status(401).json({ message: "unauthorized user " })
    }

    const user = await usermodel.findById(req.user?._id);
    let username = req.body.username
    let array = user.pass
    array = array.filter((obj) => {
        return obj.username !== username
    })
    user.pass = array
    await user.save({ validateBeforeSave: false })
    console.log("Deleted ")
    res.json({ message: "deleted that particular row " })
})

app.delete('/alldelete', verifyjwt, async (req, res) => {
    const user = await usermodel.findById(req.user?._id);
    console.log(req.user)
    if (!user) {
        return res.status(401).json({ message: "unauthorized user " })
    }
    let array = user.pass
    array = []
    user.pass = array
    await user.save({ validateBeforeSave: false })
    res.status(200).json({ message: "Deleted all the websites passwrods" })

})

app.get('/display', verifyjwt, async (req, res) => {
    console.log(req.user)
    const user = await usermodel.findById(req.user?._id);
    if (!user) {
        return res.status(401).json({ message: "unauthorized user " })
    }
    let UserWithdata = await usermodel.findById(user?._id);
    const alldata = UserWithdata.pass
    console.log(alldata)
    res.json({ data: alldata })
})
// app.listen(port, () => {
//     console.log(`http://localhost:${port}`)
// })
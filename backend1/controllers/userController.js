const ErrorHandler= require('../utils/errorHandler')
const catchAsyncError= require('../middleware/cathAsyncError');
const User= require('../models/userModel');
const cathAsyncError = require('../middleware/cathAsyncError');
const { use } = require('../routes/userRoute');
const sendToken = require('../utils/jwtToken');

//Register a user
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "This is a sample id",
            url: "profilepicurl"
        }
    });

    // Generate JWT token
    sendToken(user,201,res);
});


//Login user
exports.loginUser= cathAsyncError(async(req,res,next)=>{

    const {email,password}= req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please Enter email & password",400));
    }

    const user= await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched=await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email and password",401));
    }

    sendToken(user,200,res);
})

//Logout User
exports.logout = catchAsyncError( async (req,res,next)=>{

    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message:"Logged out"
    })
})
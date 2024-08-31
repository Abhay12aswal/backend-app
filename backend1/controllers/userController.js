const ErrorHandler= require('../utils/errorHandler')
const catchAsyncError= require('../middleware/cathAsyncError');
const User= require('../models/userModel');
const cathAsyncError = require('../middleware/cathAsyncError');
// const { use } = require('../routes/userRoute');
const sendToken = require('../utils/jwtToken');
// const { json } = require('body-parser');
const sendEmail= require("../utils/sendEmail");
const crypto = require('crypto')

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


//forgot password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

//reset password
exports.resetPassword = cathAsyncError( async ( req,res,next)=>{


    // creating token hash
    const  resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or had been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not password", 400));
    }

    user.password= req.body.password;
    user.resetPasswordToken= undefined;
    user.resetPasswordExpire= undefined;

    await user.save();

    sendToken(user,200,res);

})
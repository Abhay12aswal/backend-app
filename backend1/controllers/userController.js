const ErrorHandler= require('../utils/errorHandler')
const catchAsyncError= require('../middleware/cathAsyncError');
const User= require('../models/userModel');
const cathAsyncError = require('../middleware/cathAsyncError');
const { use } = require('../routes/userRoute');
const sendToken = require('../utils/jwtToken');
const { json } = require('body-parser');
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


//Get user detail(ME)
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const responseBody = {
        success: true,
        user,
    };

    // console.log('Response body:', responseBody);

    res.status(200).json(responseBody);
});


//update user password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
  
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not match", 400));
    }
  
    user.password = req.body.newPassword;
  
    await user.save();
  
    sendToken(user, 200, res);
  });

  //update user profile
  exports.updateProfile = cathAsyncError(async (req,res,next)=>{


    const newUserData= {
        name: req.body.name,
        email: req.body.email,
    }

    //we will add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success: true,
        user
    })
})
 

  //Get all users for admin to see (admin)
exports.getAllUser = cathAsyncError(async(req,res,next)=>{

    const users= await User.find();

    res.status(200).json({
        success:true,
        users
    })

})


//get single user(admin)
exports.getSingleUser = cathAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})



//update user role --admin
exports.updateUserRole = catchAsyncError(async(req,res,next)=>{
    const newUserData= {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user= await User.findByIdAndUpdate(req.params.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify:false
    } )

    if(!user){
        return next(new ErrorHandler("User does not exist to be admin",400))
    }

    res.status(200).json({
        success: true
    })
})

//delete user -- admin
exports.deleteUser = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`,400))
    }

    await user.deleteOne(); 

    res.status(200).json({
        success: true,
        message:"User delted successfully"
    })
})
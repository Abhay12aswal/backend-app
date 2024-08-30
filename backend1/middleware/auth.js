const ErrorHandler = require("../utils/errorHandler");
const cathAsyncError = require("./cathAsyncError");
const jwt= require('jsonwebtoken')
const User = require('../models/userModel');

exports.isAuthenticatedUser = cathAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("please login to access the resources", 401))
    }

    const decodedData= jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
})


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  };



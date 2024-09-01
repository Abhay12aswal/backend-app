const ErrorHandler= require('../utils/errorHandler')

module.exports = (err,req,res,next)=>{

    err.statusCode= err.statusCode || 500;
    err.message = err.message || "Internal server Error";

    //wrong mongodb id error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err= new ErrorHandler(message,400);
    }

    //mongoose dulplicae key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err= new ErrorHandler(message,400)
    }


    //Wrong jwt error
    if(err.code === "JsonWebTokenError"){
        const message = `Json Web token is expired, Try again`
        err= new ErrorHandler(message,400)
    }

    //jwt expire error
    if(err.code === "TokenExpiredError"){
        const message = `Json Web Token is Expired, Try again`
        err= new ErrorHandler(message,400)
    }

    
    res.status(err.statusCode).json({
        success: false,
        message:err.message,
    })
}
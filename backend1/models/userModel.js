const mongoose= require('mongoose');
const validator= require('validator');
const bcrypt = require('bcrypt')
const jwt= require('jsonwebtoken')
const crypto= require('crypto')
require('dotenv').config();


const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required: [true,"Please Enter your name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type: String,
        required:[true,"please enter your email"],
        unique: true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength:[8,"Password should be greater than 8 characters"],
        select: false,
    },
    avatar:{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type: String,
        default: "user",
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,

    
});

userSchema.pre("save",async function (next) {

    if(!this.isModified("password")){
        next();
    }

    this.password=await bcrypt.hash(this.password,10);
})

//JWT TOKEN

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id} , process.env.JWT_SECRET,{
        expiresIn: '5d',
    });
}

//compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//generting password reset token 
userSchema.methods.getResetPasswordToken = async function () {
    //Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to user
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};


module.exports= mongoose.model("User",userSchema); 
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler= require('../utils/errorHandler')
const cathAsyncError= require('../middleware/cathAsyncError');

//Create new order 
exports.newOrder = cathAsyncError(async(req,res,next)=>{

    const { 
        shippingInfo , 
        orderItems ,
        paymentInfo,
        itemsPrice,    
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo , 
        orderItems ,
        paymentInfo,
        itemsPrice,    
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user:req.user._id,
    })

    res.status(201).json({
        success:true,
        order,
    })
})
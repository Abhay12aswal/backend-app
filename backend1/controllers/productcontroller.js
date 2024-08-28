const Product = require('../models/productModel');
const ErrorHandler= require('../utils/errorHandler')
const cathAsyncError= require('../middleware/cathAsyncError');
const ApiFeatures = require('../utils/apifeatures');

//create Product -- admin
exports.createProduct = cathAsyncError(
    async(req,res,next)=>{

        const product = await Product.create(req.body);
    
        res.status(201).json({
            success:true,
            product
        })
    }
)


//get all products 
exports.getallProducts = cathAsyncError(
    async (req,res)=>{

        const apiFeatures = new ApiFeatures(Product.find(), req.query).search();
        // const products = await  Product.find();
        const products = await  apiFeatures.query;
        res.status(200).json({
            success: true,
            products
        })
    }
)


//Get product details
exports.getProductDetails = cathAsyncError(
    async(req,res,next)=>{

        const product= await Product.findById(req.params.id);
    
        if(!product){
            return next(new ErrorHandler('Product not found', 404));
        }
    
        res.status(200).json({
            success: true,
            product
        })
    }
)

//update product -- admin
exports.updateProduct = cathAsyncError(
    async( req,res)=>{

        let product = Product.findById(req.params.id);
    
        if(!product){
            return next(new ErrorHandler('Product not found', 404));
        }
    
        product = await Product.findByIdAndUpdate(req.params.id , req.body,{
            new:true,
            runValidators: true,
            useFindAndModify: false
        });
    
        res.status(200).json({
            success: true,
            product
        })
    }
)

exports.deleteProduct = cathAsyncError(
    async(req,res,next)=>{

        let {id}= req.params;
    
        const product= await Product.findById(id);
    
        if(!product){
            return next(new ErrorHandler('Product not found', 404));
        }
    
    
    
        let deletedproduct = await Product.findByIdAndDelete(id);
        console.log(deletedproduct);
    
        res.status(200).json({
            success: true,
            message:"product deleted"
        })
    }
    
)
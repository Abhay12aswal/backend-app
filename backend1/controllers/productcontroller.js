const Product = require('../models/productModel');
const ErrorHandler= require('../utils/errorHandler')
const cathAsyncError= require('../middleware/cathAsyncError');
const ApiFeatures = require('../utils/apifeatures');

//create Product -- admin
exports.createProduct = cathAsyncError(
    async(req,res,next)=>{

        req.body.user = req.user.id;

        const product = await Product.create(req.body);
    
        res.status(201).json({
            success:true,
            product
        })
    }
)


//Get all products 
exports.getallProducts = cathAsyncError(
    async (req,res)=>{

        const resultPerPage = 5;
        const productCount = await Product.countDocuments();

        const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
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
        const productCount = await Product.countDocuments();
    
        if(!product){
            return next(new ErrorHandler('Product not found', 404));
        }
        res.status(200).json({
            success: true,
            product,
            productCount
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

//Create new review or update the review
exports.createProductReview =cathAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });


//Get all reviews of a product
exports.getProductReviews= cathAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product not found"), 404);
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})


//delete review
// exports.deleteReview = cathAsyncError(async(req,res,next)=>{
//     const product = await Product.findById(req.query.productId);

//     if(!product){
//         return next(new ErrorHandler("Product not found ",404));
//     }

//     const reviews= product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())

//     let avg = 0;
  
//     reviews.forEach((rev) => {
//       avg += rev.rating;
//     });
  
//         let ratings=0;
//         if (reviews.length === 0) {
//             ratings = 0;
//         } else {
//             ratings = avg / reviews.length;
//         }
        

//     const numOfReviews = reviews.length;

//     await Product.findByIdAndUpdate(req.query.productId,{
//         reviews,ratings,numOfReviews,
//     },{
//         new:true,
//         runValidators:true,
//         useFindAndModify:false
//     })

//     ree.status(200).json({
//         success: true,
//     })
// })

exports.deleteReview = cathAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString() && rev.Comment);
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      if (rev.rating) {
        avg += rev.rating;
      }
    });
  
    let ratings = 0;
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(req.query.productId, {
      reviews, ratings, numOfReviews,
    }, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    })
  
    res.status(200).json({
      success: true,
    })
  })

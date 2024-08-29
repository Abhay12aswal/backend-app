const express= require('express');
const { getallProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productcontroller');
const { isAuthenticatedUser } = require('../middleware/auth');

const router= express.Router();

router.route('/products').get(  getallProducts)

router.route('/product/new').post(isAuthenticatedUser,createProduct)

router.
    route('/product/:id')
    .put(isAuthenticatedUser, updateProduct)
    .delete( isAuthenticatedUser , deleteProduct)
    .get(getProductDetails)

module.exports= router;
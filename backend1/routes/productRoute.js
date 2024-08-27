const express= require('express');
const { getallProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productcontroller');

const router= express.Router();

router.route('/products').get(getallProducts)

router.route('/product/new').post(createProduct)

router.route('/product/:id').put(updateProduct).delete(deleteProduct)

module.exports= router;
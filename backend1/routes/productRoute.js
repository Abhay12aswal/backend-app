const express= require('express');
const { getallProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productcontroller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router= express.Router();

router.route('/products').get( isAuthenticatedUser, getallProducts)

router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles("admin")  , createProduct)

router.
    route('/admin/product/:id')
    .put(isAuthenticatedUser,authorizeRoles("admin")  ,updateProduct)
    .delete( isAuthenticatedUser, authorizeRoles("admin")  , deleteProduct)

router.route("/product/:id").get(getProductDetails);

module.exports= router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProducts);

// Get product details by ID
router.get('/:id', productController.getProductById);

// Add new product (Admin only)
router.post('/', productController.addProduct);

module.exports = router;

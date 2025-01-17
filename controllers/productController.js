const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};

// Add a new product (Admin only)
exports.addProduct = async (req, res) => {
    const { name, description, price, stock, imageUrl, category } = req.body;
    try {
        const newProduct = new Product({ name, description, price, stock, imageUrl, category });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Error adding product' });
    }
};

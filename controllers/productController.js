import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products", details: err.message });
  }
};

// Get a product by ID
export const getProductById = async (req, res) => {
  console.log(345435435435);
  
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Error fetching product", details: err.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl; 
    let cloudinaryId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    console.log('000000', imageUrl, req.body)

    const { name, description, price, category } = req.body;
    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      cloudinaryId,
      category,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: "Error adding product", details: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let imageUrl = product.imageUrl; 
    let cloudinaryId = product.cloudinaryId;

    if (req.file) {
      if (cloudinaryId) {
        await cloudinary.uploader.destroy(cloudinaryId);
      }

      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    const { name, description, price, category } = req.body;
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.imageUrl = imageUrl;
    product.cloudinaryId = cloudinaryId;

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Error updating product", details: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.cloudinaryId) {
      await cloudinary.uploader.destroy(product.cloudinaryId);
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting product", details: err.message });
  }
};

export const uploadProductImage = upload.single("image");

import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

// ─── POST /api/product/add ────────────────────────────────────────────────────

export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    // Uploaded image file to Cloudinary and collect the secure URLs
    const imageUrls = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader
          .upload(file.path, { resource_type: 'image', timeout: 120000 })
          .then((result) => result.secure_url)
      )
    );

    await Product.create({ ...productData, image: imageUrls });

    return res.status(201).json({ success: true, message: 'Product added' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/product/list ────────────────────────────────────────────────────

export const productList = async (_req, res) => {
  try {
    const products = await Product.find({});
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/product/id ──────────────────────────────────────────────────────

export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/product/stock ──────────────────────────────────────────────────

export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    return res.json({ success: true, message: 'Stock updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

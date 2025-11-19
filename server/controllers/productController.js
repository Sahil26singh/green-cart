import {v2 as cloudinary} from 'cloudinary';
import Product from "../models/Product.js"
//- api/product/add
export const addProduct = async (req, res) => {
  try {
    console.log("Raw productData:", req.body.productData);
    const productData = JSON.parse(req.body.productData);

    console.log("Parsed productData:", productData);
    console.log("Received files:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'image',
            timeout: 120000, // 2 minutes
            });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imageUrls });

    res.status(201).json({ success: true, message: "Product added" });
  } catch (error) {
    console.error("🔥 Add Product Error:", error); // <== FULL error
    res.status(500).json({ success: false, message: error.message });
  }
};

//- api/product/list
export const productList = async (req, res)=>{
    try {
        const products = await Product.find({})
        res.json({success: true, products})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message})
    }
}
//single product - api/product/id
export const productById = async (req, res)=>{
    try {
        const { id } = req.body;
        const product = await Product.findById(id)
        res.json({success: true, product})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message})
    }
}
//- api/product/stock
export const changeStock = async (req, res)=>{
    try {
        const { id, inStock } = req.body
        await await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: "stock updated"})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message})
    }
}
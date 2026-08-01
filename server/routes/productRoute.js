import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, productList, productById, changeStock } from '../controllers/productController.js';
import { generateProductContent } from '../controllers/aiController.js';

const productRouter = express.Router();

productRouter.post('/add',      authSeller, upload.array('image'), addProduct); 
productRouter.get('/list',      productList);
productRouter.post('/id',       productById); 
productRouter.post('/stock',    authSeller, changeStock);
productRouter.post('/generate', authSeller, upload.single('image'), generateProductContent); 

export default productRouter;

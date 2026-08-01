import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';

import userRouter    from './routes/userRoute.js';
import sellerRouter  from './routes/sellerRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter    from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter   from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app  = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://green-frontend-psi.vercel.app',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => res.send('API is working'));
app.use('/api/user',    userRouter);
app.use('/api/seller',  sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart',    cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order',   orderRouter);

const start = async () => {
  await connectDB();
  await connectCloudinary();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});


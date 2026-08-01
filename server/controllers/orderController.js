import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';


const calcAmount = async (items) => {
  let subtotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    subtotal += product.offerPrice * item.quantity;
  }
  return subtotal + Math.floor(subtotal * 0.05);// 5% tax
};

// ─── POST /api/order/cod ──────────────────────────────────────────────────────

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!address || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const amount = await calcAmount(items);

    await Order.create({ userId, items, amount, address, paymentType: 'COD' });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    return res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/order/stripe ───────────────────────────────────────────────────

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const productData = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      productData.push({ name: product.name, price: product.offerPrice, quantity: item.quantity });
    }

    const amount = await calcAmount(items);

    const order = await Order.create({ userId, items, amount, address, paymentType: 'online' });

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price*100),//paise to rupee
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/loader?next=my-orders&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('placeOrderStripe error:', error); // TEMP — remove once fixed
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/order/verify-stripe ─────────────────────────────────────────────
// Called by the frontend right after Stripe redirects back — confirms payment.

export const verifyStripePayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Missing session_id' });
    }

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const { orderId, userId } = session.metadata;
      if (userId !== req.userId) {
        return res.status(403).json({ success: false, message: 'This session does not belong to you' });
      }
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      return res.json({ success: true, paid: true });
    }

    return res.json({ success: true, paid: false });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /stripe  (Stripe webhook — raw body required) ──────────────────────

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers['stripe-signature'];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook error: ${error.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const { id: paymentIntentId } = event.data.object;
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId });
      const { orderId, userId } = session.data[0].metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case 'payment_intent.payment_failed': {
      const { id: paymentIntentId } = event.data.object;
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId });
      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.warn(`Unhandled Stripe event type: ${event.type}`);
  }

  response.json({ received: true });
};

// ─── GET /api/order/user ──────────────────────────────────────────────────────

export const getUserOrder = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User id missing' });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/order/seller ────────────────────────────────────────────────────

export const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

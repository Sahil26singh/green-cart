import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

//- api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "invalid data"})
        }
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        },0)
        amount += Math.floor(amount * 0.02);
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({success: true, message: "order placed successfully"})
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error.message})
    }
}
//- api/order/stripe
export const placeOrderStripe = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        const {origin} = req.headers;
        if(!address || items.length === 0){
            return res.json({success: false, message: "invalid data"})
        }
        let productData = [];
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        },0)
        amount += Math.floor(amount * 0.02);
       const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "online",
        });

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = productData.map((item)=>{
            return{
                price_data:{
                    currency:"usd",
                    product_data:{
                        name:item.name,
                    },
                    unit_amount:Math.floor(item.price+item.price*0.02)*100
                },
                quantity: item.quantity,
            }
        })
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode:"payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata:{
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({success: true, url: session.url});
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error.message})
    }
}
// VERIFY Stripe payment
export const stripeWebhooks = async (request, response)=>{
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sin = request.headers["stripe-signature"];
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`web hook error : ${error.message}`)
    }
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,

            });
            const {orderId, userId} = session.data[0].metadata;
            await Order.findByIdAndUpdate(orderId, {isPaid: true})
            await User.findByIdAndUpdate(userId, {cartItems: {}})
            break;
        }
        case "payment_intent.payment_failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const {orderId} = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }

        default:
            console.error(`unhandled event type ${event.type}`)
            break;
    }
    response.json({received: true});
}

//-api/order/user
// server/controllers/orderController.js (or wherever getUserOrder lives)
export const getUserOrder = async (req, res) => {
  try {
    // Prefer req.userId set by auth middleware (for GET requests).
    // Fallback to req.user._id or req.body.userId only if present.
    const userId =
      req.userId ??
      (req.user && (req.user._id ?? req.user.id)) ??
      req.body?.userId ??
      null;

    if (!userId) {
      console.log("getUserOrder: missing userId on request", {
        reqUser: req.user,
        reqUserId: req.userId,
        reqBody: req.body,
      });
      return res.status(401).json({ success: false, message: "User id missing" });
    }

    const orders = await Order.find({
      userId,
    //   $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getUserOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//-api/order/seller
 export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            //  $or: [{paymentType: "COD"},{isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({success: true, orders});
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message})
    }
 }
import Stripe from "stripe";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// 🧾 CREATE STRIPE CHECKOUT SESSION
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, billingInfo, totalPrice, userId } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Convert cart to Stripe format
    const line_items = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      locale: 'en', // ✅ add this line
      customer_email: billingInfo.email,
      success_url: "http://10.16.21.240:5173/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://10.16.21.240:5173/cancel",
      metadata: { userId },
    });

    // Save order to DB
    const newOrder = new Order({
      userId,
      items,
      billingInfo,
      totalPrice,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      stripeSessionId: session.id,
    });
  
    await newOrder.save();

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ message: "Stripe session creation failed" });
  }
};

// 💵 CASH ON DELIVERY ORDER
export const createCODOrder = async (req, res) => {
  try {
    const { items, billingInfo, totalPrice, userId } = req.body;

    const order = new Order({
      userId,
      items,
      billingInfo,
      totalPrice,
      paymentMethod: "cod",
      paymentStatus: "pending",
    });

    await order.save();
    res.status(200).json({ message: "COD order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: "COD order failed" });
  }
};


export const paymentstatus = async (req, res) => {
  try {
    const { session_id, userId } = req.body;
    if (!session_id || !userId) {
      return res.status(400).json({ message: "Missing session_id or userId" });
    }

    const order = await Order.findOne({ stripeSessionId: session_id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
 
    order.paymentStatus = "paid";
    order.orderStatus = "shipped";
    await order.save();

    // ✅ Clear user cart
    await Cart.findOneAndDelete({ userId });

    res.status(200).json({ success: true, message: "Payment updated", order });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

router.post("/", (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Checkout Session completed:", session.metadata.orderId);

    const { orderId, userId, products, totalPrice, paymentMethod } = session.metadata;

    let parsedProducts = [];
    try {
      parsedProducts = JSON.parse(products);
    } catch (error) {
      console.error("Error parsing products metadata:", error.message);
    }

    Order.create({
      userId,
      products: parsedProducts,  
      totalPrice: parseInt(totalPrice, 10), 
      status: "Paid", 
      paymentMethod: paymentMethod || "Stripe",
      date: new Date(),
    })
      .then((order) => {
        console.log("Order created:", order);
        return Cart.findOne({ userId: userId });
      })
      .then((cart) => {
        if (cart) {
          const orderedProductIds = parsedProducts.map(item => item.productId.toString());
          cart.products = cart.products.filter(item => {
            return !orderedProductIds.includes(item.productId.toString());
          });
          return cart.save();
        }
      })
      .then((updatedCart) => {
        console.log("Cart updated:", updatedCart);
      })
      .catch((err) => {
        console.error("Error creating order or updating cart:", err);
      });
  }

  res.json({ received: true });
});

export default router;

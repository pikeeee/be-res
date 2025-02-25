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
    // req.body vẫn là Buffer (raw) nhờ express.raw() đã được mount ở server.js
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Xử lý event: nếu thanh toán thành công, tạo Order
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Checkout Session completed:", session.metadata.orderId);

    // Lấy các thông tin cần thiết từ metadata
    const { orderId, userId, products, totalPrice, paymentMethod } = session.metadata;

    // Nếu products được lưu dưới dạng JSON string, chuyển sang object
    let parsedProducts = [];
    try {
      parsedProducts = JSON.parse(products);
    } catch (error) {
      console.error("Error parsing products metadata:", error.message);
    }

    // Tạo Order mới (order chính là đặt chỗ)
    Order.create({
      userId,
      products: parsedProducts,  // Ví dụ: [{ productId: "xxx", quantity: 2 }, ...]
      totalPrice: parseInt(totalPrice, 10), // ép sang số
      status: "Paid", // Đánh dấu đơn hàng đã thanh toán thành công
      paymentMethod: paymentMethod || "Stripe",
      date: new Date(),
    })
      .then((order) => {
        console.log("Order created:", order);
        // Sau khi tạo Order thành công, cập nhật giỏ hàng của người dùng
        return Cart.findOne({ userId: userId });
      })
      .then((cart) => {
        if (cart) {
          // Lấy danh sách productIds trong đơn đặt chỗ
          const orderedProductIds = parsedProducts.map(item => item.productId.toString());
          // Chỉ giữ lại các mặt hàng không có trong đơn đặt chỗ
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

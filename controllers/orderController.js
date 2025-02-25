import Order from "../models/Order.js";

// Create a new order
export const createOrder = async (req, res) => {
  const { userId, products, totalPrice, paymentMethod } = req.body;
  try {
    const newOrder = new Order({ userId, products, totalPrice, paymentMethod });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Error creating order" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId ? req.params.orderId.trim() : "";
    const order = await Order.findById(orderId);
    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Error fetching order" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.params.userId ? req.params.userId.trim() : "";
    console.log(userId, '=======');
    if (!userId) {
      return res.status(400).json({ error: "Missing userId in URL" });
    }
    const orders = await Order.find({ userId }).sort({ date: -1 });
    res.status(200).json(orders || []);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

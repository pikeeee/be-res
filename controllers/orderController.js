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

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Error fetching order" });
  }
};

// Get list of orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 }); // sắp xếp giảm dần theo ngày
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

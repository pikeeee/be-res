const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
    const { userId, products, totalPrice, paymentMethod } = req.body;
    try {
        const newOrder = new Order({ userId, products, totalPrice, paymentMethod });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: 'Error creating order' });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching order' });
    }
};

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{
        productId: String,
        quantity: Number
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    paymentMethod: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

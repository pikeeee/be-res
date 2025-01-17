const mongoose = require('mongoose');

// Định nghĩa schema cho giỏ hàng
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Liên kết với schema User
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product' // Liên kết với schema Product
            },
            quantity: {
                type: Number,
                default: 1,
                required: true
            }
        }
    ]
}, { timestamps: true }); // Tự động thêm thời gian tạo và cập nhật

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;

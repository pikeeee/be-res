const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    orders: [{
        orderId: String,
        status: String,
        totalPrice: Number,
        products: [{
            productId: String,
            quantity: Number
        }],
        paymentMethod: String,
        date: Date
    }]
});

UserSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);

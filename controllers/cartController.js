const Cart = require('../models/Cart');

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId');
        if (!cart) return res.status(404).json({ message: 'Cart not found' });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });

        // Nếu giỏ hàng chưa tồn tại, tạo mới
        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, quantity }] });
        } else {
            // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.products = cart.products.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

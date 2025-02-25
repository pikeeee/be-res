import Cart from "../models/Cart.js";

// Lấy giỏ hàng của người dùng
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate("products.productId");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [{ productId, quantity }] });
    } else {
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const updateCartItem = async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  if (quantity == null || typeof quantity !== "number") {
    return res.status(400).json({ message: "A valid quantity is required" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    console.log(11122233, cart);
    console.log(11122233666, cart.products);
    console.log(99111, req.params)
    const itemId_await = req.params.productId
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === itemId_await
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export default { getCart, addToCart, updateCartItem };

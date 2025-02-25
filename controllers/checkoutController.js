import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15", // chọn version phù hợp
});

const createCheckoutSession = async (req, res) => {
  try {
    // Nhận dữ liệu từ frontend
    const {
      amount,        // Số tiền cần thanh toán (đơn vị cent)
      currency,      // Đơn vị tiền tệ (mặc định usd)
      orderId,       // ID đơn hàng (tạo từ frontend)
      userId,        // ID người dùng
      products,      // Danh sách sản phẩm được chọn, dạng chuỗi JSON
      totalPrice,    // Tổng số tiền (đã chuyển thành chuỗi)
      paymentMethod, // Phương thức thanh toán (ví dụ: "Stripe")
    } = req.body;

    // Kiểm tra bắt buộc các trường cần thiết (bạn có thể bổ sung kiểm tra bổ sung nếu cần)
    if (!userId || !products || !totalPrice) {
      return res.status(400).json({ error: "Missing required order metadata" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: {
              name: "Order #" + orderId,
            },
            unit_amount: amount, // đơn vị là cent
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/order",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        orderId,
        userId,
        products,      // Dạng chuỗi JSON
        totalPrice,    // Dạng chuỗi, sẽ được ép về Number trong webhook
        paymentMethod, // Ví dụ: "Stripe"
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    res.status(500).json({ error: error.message });
  }
};

export default { createCheckoutSession };

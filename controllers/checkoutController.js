import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15", 
});

const createCheckoutSession = async (req, res) => {
  try {
    const {
      amount,        
      currency,      
      orderId,       
      userId,        
      products,      
      totalPrice,    
      paymentMethod, 
    } = req.body;

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
            unit_amount: amount, 
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
        products,      
        totalPrice,    
        paymentMethod, 
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    res.status(500).json({ error: error.message });
  }
};

export default { createCheckoutSession };

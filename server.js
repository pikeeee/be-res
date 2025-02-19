const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/SWP_restaurant")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Xóa tài khoản chưa xác thực sau 10 phút
const deleteUnverifiedAccounts = async () => {
  try {
    const expirationTime = 10 * 60 * 1000;
    const thresholdDate = new Date(Date.now() - expirationTime);

    console.log(`Đang xóa tài khoản chưa xác thực trước: ${thresholdDate}`);

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: thresholdDate },
    });

    console.log(`Số tài khoản đã xóa: ${result.deletedCount}`);
  } catch (error) {
    console.error("Lỗi khi xóa tài khoản chưa xác thực:", error);
  }
};

// Chạy mỗi 10 phút
setInterval(deleteUnverifiedAccounts, 10 * 60 * 1000);

// Routes
app.get("/", (req, res) => res.send("Backend is running"));

// Import routes
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");

// Use routes
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

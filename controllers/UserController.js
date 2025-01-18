const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationCode } = require("../services/EmailService");

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidEmailName = (email) => {
  const emailName = email.split("@")[0];
  const emailNameRegex = /^[a-zA-Z0-9]{6,}$/;
  return emailNameRegex.test(emailName);
};

const isValidPassword = (password) => {
  const passwordRegex = /^[a-zA-Z0-9]{6,}$/;
  return passwordRegex.test(password);
};

const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
  return phoneRegex.test(phoneNumber);
};

// Hàm để tạo mã xác thực 6 chữ số
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Random 6 chữ số
};

// User Signup
exports.signup = async (req, res) => {
  const { username, email, password, phoneNumber, address } = req.body;
  const normalizedEmail = email.toLowerCase();

  if (
    !username ||
    typeof username !== "string" ||
    username.trim().length === 0
  ) {
    return res.status(400).json({ message: "Username is required" });
  }

  // Kiểm tra địa chỉ email
  if (
    !normalizedEmail ||
    typeof normalizedEmail !== "string" ||
    !isValidEmail(normalizedEmail) ||
    !isValidEmailName(normalizedEmail) ||  // Kiểm tra tên người dùng trong email
    !normalizedEmail.endsWith("@gmail.com")
  ) {
    return res.status(400).json({ message: "Email name must be at least 6 characters long and cannot contain special characters" });
  }

  // Kiểm tra mật khẩu
  if (!password || typeof password !== "string" || !isValidPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long and cannot contain special characters",
    });
  }

  // Kiểm tra số điện thoại
  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({
      message: "Phone number must be a valid Vietnamese phone number",
    });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo mã xác thực 6 chữ số
    const verificationCode = generateVerificationCode();

    // Gửi mã xác thực tới email của người dùng
    await sendVerificationCode(normalizedEmail, verificationCode);

    // Lưu thông tin người dùng với mã xác thực (có thể lưu vào cơ sở dữ liệu tạm thời)
    const newUser = new User({
      username,
      email: normalizedEmail,
      passwordHash,
      phoneNumber,
      address,
      verificationCode,
      createdAt: Date.now(),
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully. Please check your email for the verification code." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xác thực mã
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Xác thực thành công, cập nhật trạng thái xác thực của người dùng
    user.isVerified = true;
    user.verificationCode = null; // Xóa mã xác thực sau khi xác thực thành công
    await user.save();

    // Trả phản hồi thành công trước khi gọi hàm xóa tài khoản chưa xác thực
    res.status(200).json({ message: "Email verified successfully" });

    // Gọi hàm xóa tài khoản chưa xác thực nhưng không await, đảm bảo lỗi không ảnh hưởng
    deleteUnverifiedAccounts().catch(error => {
      console.error("Error deleting unverified accounts:", error);
    });

  } catch (error) {
    // Đảm bảo rằng bất kỳ lỗi nào đều sẽ chỉ gửi phản hồi một lần
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      console.error("Error after response sent:", error);
    }
  }
};

//edit pass
exports.editPassword = async (req, res) => {
  const { password, newPassword } = req.body; // Lấy mật khẩu từ request body
  const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token is required for authentication" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is empty or invalid" });
  }

  if (!newPassword || typeof newPassword !== "string") {
    return res
      .status(400)
      .json({ message: "New password is empty or invalid" });
  }

  try {
    // Giải mã token để lấy userId từ JWT
    const decoded = jwt.verify(token, "your_jwt_secret");

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // So sánh mật khẩu hiện tại với mật khẩu đã mã hóa
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Kiểm tra xem tài khoản đã được xác thực chưa
    if (user.verificationCode !== null) {
      return res.status(400).json({ message: "Tài khoản chưa được xác thực" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
    res.status(200).json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Gửi mã xác thực khi quên mật khẩu
exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    await sendVerificationCode(normalizedEmail, verificationCode);
    res.status(200).json({ message: "Verification code sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đặt lại mật khẩu mới sau khi xác thực mã
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase();

  // Kiểm tra tính hợp lệ của mật khẩu mới
  if (!newPassword || typeof newPassword !== "string" || !isValidPassword(newPassword)) {
    return res.status(400).json({ message: "Password must be at least 6 characters long and cannot contain special characters" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    // Kiểm tra nếu người dùng không tồn tại hoặc mã xác thực chưa bị xóa
    if (!user || user.verificationCode !== null) {
      return res.status(400).json({ message: "User not found or verification incomplete" });
    }

    // Đặt lại mật khẩu
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Fail" });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};

// Edit User Profile
exports.editProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    const userId = decoded.userId;
    const { username, phoneNumber, address } = req.body;

    // Validate the inputs
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        message: "Phone number must be a valid Vietnamese phone number",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, phoneNumber, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

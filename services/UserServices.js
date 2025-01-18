const bcrypt = require("bcrypt");
const User = require("../model/UserModel"); // Import User model

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, password } = newUser;
    try {
      const checkUser = await User.findOne({ email: email });
      if (checkUser !== null) {
        return resolve({
          status: "ERR",
          message: "The email is already registered",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10); // Hashing the password
      const createUser = await User.create({
        username,
        email,
        password: hashedPassword, // Save hashed password
      });
      resolve({
        status: "OK",
        message: "User registered successfully",
        data: createUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return resolve({
          status: "ERR",
          message: "Email not found",
        });
      }

      const validPassword = await bcrypt.compare(password, user.password); // Compare passwords
      if (!validPassword) {
        return resolve({
          status: "ERR",
          message: "Invalid password",
        });
      }

      resolve({
        status: "OK",
        message: "Login successful",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
};

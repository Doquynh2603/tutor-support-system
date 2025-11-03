/**
 * File: authController.js
 * Mục đích: Xử lý authentication (đăng nhập, đăng ký, JWT)
 * Vai trò:
 *   - Login/Register với SQL Server
 *   - Tạo và verify JWT tokens
 *   - Xác thực người dùng
 */

const User = require("../models/UserSQL");
const jwt = require("jsonwebtoken");

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    // Debug: log incoming body
    console.log(">>> authController.login - req.body:", req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: { include: ["password"] }, // Include password field
    });

    if (!user) {
      console.log("🔍 authController.login: User not found for email:", email);
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    // Check password - so sánh plaintext với plaintext
    // Nếu password trong DB là bcrypt hash, dùng: await user.comparePassword(password)
    // Nếu password trong DB là plaintext, dùng: user.password === password
    console.log("🔐 Checking password...");
    console.log("   - Password from frontend (plaintext):", password);
    console.log(
      "   - Password from DB:",
      user.password.substring(0, 20) + "..."
    );

    let isPasswordValid = false;

    // Thử plaintext comparison trước
    if (user.password === password) {
      isPasswordValid = true;
      console.log("✅ Password valid (plaintext match)");
    } else {
      // Thử bcrypt comparison nếu password có dạng hash
      try {
        const bcrypt = require("bcryptjs");
        isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          console.log("✅ Password valid (bcrypt match)");
        }
      } catch (bcryptError) {
        console.log("❌ Bcrypt comparison failed:", bcryptError.message);
      }
    }

    if (!isPasswordValid) {
      console.log(
        "🔐 authController.login: Invalid password for email:",
        email
      );
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password; // Xóa password trước khi response

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      role = "student",
      phone,
      dateOfBirth,
    } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, password và fullName là bắt buộc",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Create new user (password will be auto-hashed by model hook)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      fullName,
      role,
      phone,
      dateOfBirth,
    });

    // Generate token
    const token = generateToken(newUser.id);

    // Remove password from response
    const userResponse = newUser.toJSON();

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không được cung cấp",
      });
    }

    // Remove Bearer prefix if exists
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user.toJSON();

    res.status(200).json({
      success: true,
      message: "Lấy thông tin user thành công !!",
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify socket token (for Socket.IO authentication)
 */
const verifySocketToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user.toJSON();
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  login,
  register,
  verifyToken,
  getProfile,
  verifySocketToken,
};

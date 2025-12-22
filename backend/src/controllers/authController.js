const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserAccount = require("../models/UserSQL");
const redisClient = require("../config/redis");
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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
      });
    }

    // Tìm user theo email
    const user = await UserAccount.findOne({
      where: { email: email.toLowerCase() },
    });

    console.log("🔍 [Login] User found:", !!user);
    if (user) {
      console.log(
        "🔍 [Login] Status:",
        user.status,
        "Verified:",
        user.is_verified
      );
      console.log("🔍 [Login] Password hash exists:", !!user.password_hash);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Vui lòng xác thực email",
      });
    }

    // So sánh password với hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("🔍 [Login] Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
    }

    // Generate token
    const token = generateToken(user.user_id);

    // Remove password_hash from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
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
      name,
      role = "user",
      phone,
      dateOfBirth,
      locationDetail,
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password và name là bắt buộc",
      });
    }

    // Check if user already exists
    const existingUser = await UserAccount.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Tạo user mới (password sẽ được hash bởi model hook)
    const newUser = await UserAccount.create({
      email: email.toLowerCase(),
      password_hash: password,
      name,
      role,
      phone,
      dateOfBirth,
      locationDetail,
      status: true,
      is_verified: false,
    });

    // Generate token
    const token = generateToken(newUser.user_id);

    // Remove password_hash from response
    const userResponse = newUser.toJSON();
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Đăng xuất (Logout)
 * Cơ chế: Lưu token vào Blacklist trong Redis
 */
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(200).json({ message: "Đã đăng xuất (không có token)" });
    }

    const token = authHeader.split(" ")[1];
    if (token) {
      // lấy thời gian hết hạn của token để set TTL cho redis
      const decoded = jwt.decode(token);

      // mặc định blacklist 24h nếu không đọc được exp
      let ttl = 24 * 60 * 60;

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        ttl = decoded.exp - currentTime; // thời gian còn lại của token
      }
      if (ttl > 0) {
        await redisClient.set(`blacklist_token:${token}`, "true", { EX: ttl });
        console.log(`🛑 [Logout] Token blacklisted with TTL ${ttl} seconds`);
      }
    }
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {}
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
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserAccount.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
    req.user = user;
    next();
  } catch (error) {
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
    delete user.password_hash;
    res.status(200).json({
      success: true,
      message: "Lấy thông tin user thành công !!",
      data: { user },
    });
  } catch (error) {
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
    const user = await UserAccount.findByPk(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }
    const userObj = user.toJSON();
    delete userObj.password_hash;
    return userObj;
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
  logout,
};

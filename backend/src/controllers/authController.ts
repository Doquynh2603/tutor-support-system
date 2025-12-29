import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserAccount from "../models/UserSQL";
import redisClient from "../config/redis";

interface JWTPayload extends JwtPayload {
  userId: string;
}

interface UserResponse {
  user_id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
  locationDetail?: string;
  status: boolean;
  is_verified: boolean;
  created_at?: Date;
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
    role?: string;
    phone?: string;
    dateOfBirth?: string;
    locationDetail?: string;
  };
}

interface AuthRequest extends Request {
  user?: UserResponse;
}
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
/**
 * Generate JWT token
 */
const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
    algorithm: "HS256",
  };

  return jwt.sign({ userId }, JWT_SECRET, options);
};

/**
 * Login user
 */
const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
      });
      return;
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
      res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
      return;
    }

    if (!user.status) {
      res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa",
      });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({
        success: false,
        message: "Vui lòng xác thực email",
      });
      return;
    }

    // So sánh password với hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("🔍 [Login] Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Email hoặc password không đúng",
      });
      return;
    }

    // Generate token
    const token = generateToken(user.user_id);

    // Remove password_hash from response
    const userResponse = user.toJSON() as any;
    delete userResponse.password_hash;
    console.log("✅ [Login] Success:", user.user_id);
    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: userResponse as UserResponse,
        token,
      },
    });
  } catch (error: any) {
    console.error("❌ [Login] Error:", error.message);
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
const register = async (req: RegisterRequest, res: Response): Promise<void> => {
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
      res.status(400).json({
        success: false,
        message: "Email, password và name là bắt buộc",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await UserAccount.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
      return;
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
    const userResponse = newUser.toJSON() as any;
    delete userResponse.password_hash;
    console.log("✅ [Register] Success:", newUser.user_id);
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: userResponse as UserResponse,
        token,
      },
    });
  } catch (error: any) {
    console.error("❌ [Register] Error:", error.message);
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
const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(200).json({
        success: true,
        message: "Đã đăng xuất (không có token)",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (token) {
      // lấy thời gian hết hạn của token để set TTL cho redis
      const decoded = jwt.decode(token) as JWTPayload | null;

      // mặc định blacklist 24h nếu không đọc được exp
      let ttl = 24 * 60 * 60;

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        ttl = decoded.exp - currentTime; // thời gian còn lại của token
      }
      if (ttl > 0) {
        await redisClient.client.set(`blacklist_token:${token}`, "true", {
          EX: ttl,
        });
        console.log(`🛑 [Logout] Token blacklisted with TTL ${ttl} seconds`);
      }
    }
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error: any) {
    console.error("❌ [Logout] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

/**
 * Verify JWT token
 */
const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token không được cung cấp",
      });
      return;
    }
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    // Check blacklist
    const isBlacklisted = await redisClient.client.get(
      `blacklist_token:${token}`
    );
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: "Token đã hết hạn (đã đăng xuất)",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JWTPayload;

    const user = await UserAccount.findByPk(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
      return;
    }

    // Attach user to request
    const userObj = user.toJSON() as any;
    delete userObj.password_hash;
    req.user = userObj as UserResponse;

    next();
  } catch (error: any) {
    console.error("❌ [verifyToken] Error:", error.message);
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Không được phép truy cập",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Lấy thông tin user thành công",
      data: { user: req.user },
    });
  } catch (error: any) {
    console.error("❌ [getProfile] Error:", error.message);
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
const verifySocketToken = async (token: string): Promise<UserResponse> => {
  try {
    const isBlacklisted = await redisClient.client.get(
      `blacklist_token:${token}`
    );
    if (isBlacklisted) {
      throw new Error("Token đã bị thu hồi");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JWTPayload;

    const user = await UserAccount.findByPk(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const userObj = user.toJSON() as any;
    delete userObj.password_hash;

    return userObj as UserResponse;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export default {
  login,
  register,
  verifyToken,
  getProfile,
  verifySocketToken,
  logout,
};

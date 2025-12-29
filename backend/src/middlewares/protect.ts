import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import redisModule from "../config/redis";
import UserAccount from "../models/UserSQL"; // Import Model chuẩn

// Xử lý Redis client
const redisClient = (redisModule as any).client || redisModule;

interface DecodedToken extends JwtPayload {
  userId: string;
  role?: string;
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
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

    // 1. Kiểm tra blacklist từ Redis
    const isBlacklisted = await redisClient.get(`blacklist_token:${token}`);
    if (isBlacklisted) {
      console.warn("🚫 [protect] Token bị từ chối (nằm trong blacklist)");
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã kết thúc, vui lòng đăng nhập lại",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedToken;

    // 2. Cache user profile
    const cacheKey = `user_profile:${decoded.userId}`;
    const cachedUser = await redisClient.get(cacheKey);

    if (cachedUser) {
      (req as any).user = JSON.parse(cachedUser);
      (req as any).isAuthenticated = true;
      return next();
    }

    // 3. Fetch DB (Đã bỏ :any vì UserAccount đã có Type)
    const user = await UserAccount.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ - user không tồn tại",
      });
    }

    // Attach user to request
    // TypeScript sẽ tự động gợi ý các trường user_id, email... từ Model
    const userPayload = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
    };

    (req as any).user = userPayload;
    (req as any).isAuthenticated = true;
    // Lưu user vào redis cache với TTL 1 giờ
    await redisClient.set(cacheKey, JSON.stringify(userPayload), { EX: 3600 });

    next();
  } catch (error: any) {
    console.error("🔐 Token verification error:", error.message);
    console.log("⏭️ [protect] Token invalid - cho phép truy cập public");
    (req as any).isAuthenticated = false;
    return next();
  }
};

export default protect;

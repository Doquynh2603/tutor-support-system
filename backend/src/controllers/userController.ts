/**
 * File: userController.js
 * Mục đích: Controller xử lý logic nghiệp vụ cho Users
 * Vai trò:
 *   - CRUD operations cho User model (MongoDB)
 *   - Xử lý request/response cho user routes
 * Lưu ý:
 *   - Password không được trả về trong response (.select('-password'))
 *   - Cần thêm validation và authentication middleware
 *   - Error handling cơ bản, nên cải thiện với custom errors
 */

import { Request, Response } from "express";
import User from "../models/User";
import redisConfig from "../config/redis";
const redisClient = redisConfig.client;

interface UserData {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}
/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Public
 */
const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📋 [getUsers] Fetching all users...");
    // Check Redis cache first
    const cacheKey = "users:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getUsers] Returning from Redis Cache");
      const users = JSON.parse(cachedData);
      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
        message: "Lấy danh sách user từ Cache",
      });
      return;
    }
    // If no cache, fetch from DB
    console.log("🐢 [getUsers] Fetching from DB...");
    const users = await User.find().select("-password");
    await redisClient.set(cacheKey, JSON.stringify(users), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const cacheKey = `user_profile:${userId}`;

    // 1. Check Redis cache first
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      console.log("⚡ [getUserById] Returning from Redis Cache");
      res.status(200).json({
        success: true,
        data: JSON.parse(cachedUser),
        message: "Lấy thông tin user từ Cache",
      });
      return;
    }
    // 2. If no cache, fetch from DB
    console.log("🐢 [getUserById] Fetching from DB...");
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    // 3. Cache the user profile for future requests
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Public
 */
const createUser = async (
  req: Request<never, never, UserData>,
  res: Response
): Promise<void> => {
  try {
    const user = await User.create(req.body);
    await redisClient.del("users:all"); // Xóa cache danh sách user khi có user mới
    console.log(`✅ [createUser] User created: ${user._id}`);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Public
 */
const updateUser = async (
  req: Request<{ id: string }, never, UserData>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    // 1. Xóa cache profile của user này để lần sau load lại sẽ thấy data mới
    await redisClient.del(`user_profile:${userId}`);

    //  2. Xóa cache danh sách tổng (nếu cần thiết, vì data trong list cũng thay đổi)

    await redisClient.del("users:all");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Public
 */
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    // Xóa mọi cache liên quan đến user này
    await redisClient.del(`user_profile:${userId}`);
    await redisClient.del("users:all");

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

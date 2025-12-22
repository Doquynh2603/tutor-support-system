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

const User = require("../models/User");
const redisClient = require("../config/redis");
/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Public
 */
const getUsers = async (req, res) => {
  try {
    // Check Redis cache first
    const cacheKey = "users:all";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        count: JSON.parse(cachedData).length,
        data: JSON.parse(cachedData),
        message: "Lấy danh sách user từ Cache",
      });
    }
    // If no cache, fetch from DB
    const users = await User.find().select("-password");
    await redisClient.set(cacheKey, JSON.stringify(users), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
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
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user_profile:${userId}`;

    // 1. Check Redis cache first
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedUser),
        message: "Lấy thông tin user từ Cache",
      });
    }
    // 2. If no cache, fetch from DB
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // 3. Cache the user profile for future requests
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 }); // Cache for 1 hour
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
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
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    await redisClient.del("users:all"); // Xóa cache danh sách user khi có user mới
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
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
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // 1. Xóa cache profile của user này để lần sau load lại sẽ thấy data mới
    await redisClient.del(`user_profile:${userId}`);
    //  2. Xóa cache danh sách tổng (nếu cần thiết, vì data trong list cũng thay đổi)

    await redisClient.del("users:all");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
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
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Xóa mọi cache liên quan đến user này
    await redisClient.del(`user_profile:${userId}`);
    await redisClient.del("users:all");

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

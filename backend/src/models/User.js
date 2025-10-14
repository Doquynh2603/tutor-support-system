/**
 * File: User.js
 * Mục đích: Model User cho MongoDB
 * Vai trò:
 *   - Định nghĩa schema và validation cho collection users
 *   - Lưu trữ thông tin người dùng (student, tutor, admin)
 * Lưu ý:
 *   - Password được select: false (không trả về mặc định)
 *   - Email phải unique và lowercase
 *   - Cần hash password trước khi lưu (chưa implement)
 *   - Swagger schema được định nghĩa cho API docs
 */

const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: Hashed password
 *         name:
 *           type: string
 *           description: User name
 *         role:
 *           type: string
 *           enum: [student, tutor, admin]
 *           description: User role
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Không trả về password khi query
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'tutor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);

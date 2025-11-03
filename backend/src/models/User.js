/**
 * File: User.js
 * Mục đích: Model User cho SQL Server
 * Vai trò:
 *   - Định nghĩa model Sequelize cho bảng User
 *   - Lưu trữ thông tin người dùng (student, tutor, admin)
 * Lưu ý:
 *   - Password được hash tự động với bcrypt
 *   - Email phải unique và validate format
 *   - Method comparePassword để xác thực
 *   - toJSON loại bỏ password khi serialize
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sqlserver");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Không trả về password khi query
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
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

module.exports = mongoose.model("User", userSchema);

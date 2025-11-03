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
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("student", "tutor", "admin"),
      allowNull: false,
      defaultValue: "student",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    locationDetail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "User",
    timestamps: false, // We're managing timestamps manually
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password; // Never return password in JSON
  return values;
};

module.exports = User;

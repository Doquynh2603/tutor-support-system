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

const UserAccount = sequelize.define(
  "UserAccount",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "user",
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    locationDetail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Ward",
        key: "id",
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "UserAccount",
    timestamps: false, // We're managing timestamps manually
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password_hash")) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  }
);

// Instance methods
UserAccount.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

UserAccount.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password_hash; // Never return password in JSON
  return values;
};

module.exports = UserAccount;

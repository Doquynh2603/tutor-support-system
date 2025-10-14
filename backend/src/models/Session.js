/**
 * File: Session.js
 * Mục đích: Model Session cho SQL Server
 * Vai trò:
 *   - Định nghĩa schema cho table sessions
 *   - Quản lý thông tin buổi học giữa tutor và student
 * Lưu ý:
 *   - Sử dụng Sequelize ORM
 *   - tutorId và studentId là reference đến User (chưa setup foreign key)
 *   - Status enum phải match với logic ở frontend
 *   - Duration tính bằng phút
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sqlserver');

const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tutorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'sessions',
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = Session;

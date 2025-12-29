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

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/sqlserver";

export type SessionStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled";

interface SessionAttributes {
  id: number;
  tutorId: string;
  studentId: string;
  subject: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: SessionStatus;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreationAttributes
  extends Optional<
    SessionAttributes,
    "id" | "status" | "notes" | "createdAt" | "updatedAt"
  > {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  public id!: number;
  public tutorId!: string;
  public studentId!: string;
  public subject!: string;
  public scheduledAt!: Date;
  public duration!: number;
  public status!: SessionStatus;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init(
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "in-progress",
        "completed",
        "cancelled"
      ),
      defaultValue: "scheduled",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "sessions",
    timestamps: true,
  }
);

export default Session;

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

import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/sqlserver";
import bcrypt from "bcryptjs";

// 1. Định nghĩa Interface cho các thuộc tính của User
interface UserAttributes {
  user_id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string | null;
  role: string;
  status: boolean;
  is_verified: boolean;
  dateOfBirth?: string | Date | null;
  locationDetail?: string | null;
  address_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// 2. 2. Định nghĩa Interface cho lúc tạo User (các trường optional)
interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "user_id"
    | "phone"
    | "status"
    | "is_verified"
    | "dateOfBirth"
    | "locationDetail"
    | "address_id"
    | "created_at"
    | "updated_at"
  > {}
class UserAccount
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public user_id!: string;
  public email!: string;
  public password_hash!: string;
  public name!: string;
  public phone!: string | null;
  public role!: string;
  public status!: boolean;
  public is_verified!: boolean;
  public dateOfBirth!: string | Date | null;
  public locationDetail!: string | null;
  public address_id!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Instance method: So sánh password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  }

  // Override toJSON để ẩn password
  toJSON() {
    const values = { ...this.get() };
    delete (values as any).password_hash;
    return values;
  }
}

UserAccount.init(
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
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
      // Lưu ý: references thường được define ở file association riêng,
      // nhưng để đây cũng không sao
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
    sequelize,
    tableName: "UserAccount",
    timestamps: false, // Tự quản lý created_at
    hooks: {
      beforeCreate: async (user: UserAccount) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user: UserAccount) => {
        if (user.changed("password_hash")) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  }
);

export default UserAccount;

/**
 * File: models/Tutor.js
 * Mục đích: Sequelize model cho bảng Tutors
 * Vai trò: Định nghĩa cấu trúc dữ liệu gia sư và các operations
 */

const { DataTypes } = require("sequelize");

const TutorModel = (sequelize) => {
  const Tutor = sequelize.define(
    "Tutor",
    {
      tutor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "tutor_id",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: "Liên kết với bảng Users",
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "full_name",
        validate: {
          len: [2, 100],
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: "phone",
        validate: {
          isNumeric: true,
          len: [10, 15],
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth",
        validate: {
          isDate: true,
          isBefore: new Date().toISOString(), // Không được sinh sau ngày hôm nay
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "address",
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "bio",
        comment: "Mô tả bản thân",
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "education",
        comment: "Học vấn",
      },
      experience: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "experience",
        comment: "Kinh nghiệm giảng dạy",
      },
      subjects: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "subjects",
        comment: "Danh sách môn học có thể dạy (JSON string)",
        get() {
          const rawValue = this.getDataValue("subjects");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue("subjects", JSON.stringify(value || []));
        },
      },
      specialties: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "specialties",
        comment: "Chuyên môn",
      },
      hourlyRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "hourly_rate",
        comment: "Giá theo giờ (VND)",
        validate: {
          min: 0,
        },
      },
      availability: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "availability",
        comment: "Thời gian có thể dạy",
      },
      avatar: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "avatar",
        comment: "URL ảnh đại diện",
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "verified",
        comment: "Đã xác thực",
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        field: "rating",
        validate: {
          min: 0,
          max: 5,
        },
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "total_reviews",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "tutors",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["verified"],
        },
        {
          fields: ["is_active"],
        },
        {
          fields: ["rating"],
        },
      ],
    }
  );

  return Tutor;
};

module.exports = TutorModel;

/**
 * File: studentModel.js
 * Mục đích: Model xử lý database operations cho Student profile
 * Vai trò: Các hàm query lấy và cập nhật thông tin học sinh
 */

const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../config/sqlserver");

/**
 * Lấy thông tin profile học sinh
 * @param {number} userId - User ID
 * @returns {Promise} Student profile data
 */

const getStudentProfile = async (userId) => {
  try {
    const query = `
        SELECT * FROM student_info
        WHERE user_id = :userId
        `;
    const student = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });
    if (!student || student.length === 0) {
      throw new Error("Không tìm thấy thông tin học sinh");
    }
    console.log(
      "✅ [studentModel] getStudentProfile: Tìm thấy thông tin học sinh",
      student
    );
    // Map name to fullName for frontend compatibility
    const profile = student[0];
    return {
      ...profile,
      fullName: profile.name,
    };
  } catch (error) {
    console.error("❌ [studentModel] getStudentProfile error:", error.message);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile học sinh
 * @param {number} userId - User ID
 * @param {object} profileData - Dữ liệu cần cập nhật
 * @returns {Promise} Updated student profile
 */

const updateStudentProfile = async (userId, profileData) => {
  try {
    const {
      fullName,
      phone,
      locationDetail,
      dateOfBirth,
      address_id,
      gradeLevel,
      school,
    } = profileData;

    console.log(
      `📝 [studentModel] updateStudentProfile: Cập nhật cho user ID: ${userId}`
    );
    console.log("   - Dữ liệu:", profileData);

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      throw new Error("Số điện thoại phải có 10-11 chữ số");
    }

    if (fullName && (fullName.length < 2 || fullName.length > 255)) {
      throw new Error("Họ tên phải từ 2-255 ký tự");
    }
    const query = `
      EXEC sp_UpdateStudentInfo
        @StudentUserId = :userId,
        @name = :fullName,
        @dateOfBirth = :dateOfBirth,
        @phone = :phone,
        @address_id = :address_id,
        @locationDetail = :locationDetail,
        @gradeLevel = :gradeLevel,
        @school = :school`;
    await sequelize.query(query, {
      replacements: {
        userId,
        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
        phone: phone || null,
        address_id: address_id || null,
        locationDetail: locationDetail || null,
        gradeLevel: gradeLevel || null,
        school: school || null,
      },
    });
    console.log("✅ [studentModel] Cập nhật thành công");
    return await getStudentProfile(userId);
  } catch (error) {
    console.error(
      "❌ [studentModel] updateStudentProfile error:",
      error.message
    );
    throw error;
  }
};
module.exports = {
  getStudentProfile,
  updateStudentProfile,
};

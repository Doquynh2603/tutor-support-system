/**
 * Mục đích: Service layer cho Tutor profile management
 * Vai trò:
 *   - Xử lý business logic cho CRUD operations của tutor profile
 *   - Tương tác với SQL Server database thông qua stored procedures
 */

const { sequelize } = require("../../config/sqlserver");
const { QueryTypes } = require("sequelize");

/**
 * Lấy thông tin profile của gia sư (sử dụng view tutor_info - có đầy đủ info địa điểm)
 */
const getTutorProfile = async (userId) => {
  try {
    console.log(`🔍 [getTutorProfile] Fetching for user ID: ${userId}`);

    // Query từ view tutor_info - đã JOIN với UserAccount
    const query = `SELECT 
        *
      FROM tutor_info 
      WHERE user_id = :userId`;

    const results = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    if (!results || results.length === 0) {
      throw new Error("Không tìm thấy thông tin gia sư");
    }

    const result = results[0];
    console.log(`✅ [getTutorProfile] Found tutor profile:`, result);
    return result;
  } catch (error) {
    console.error("❌ [getTutorProfile] Error:", error.message);
    throw new Error(error.message || "Lỗi khi lấy thông tin gia sư");
  }
};

/**
 * Cập nhật thông tin profile gia sư (sử dụng stored procedure)
 */
const updateTutorProfile = async (userId, profileData) => {
  try {
    const {
      name,
      dateOfBirth,
      phone,
      locationDetail,
      address_id,
      introduction,
      experience_years,
      specialties,
    } = profileData;

    console.log(
      `📝 [tutorModel] updateTutorProfile: Cập nhật cho user ID: ${userId}`
    );
    console.log("   - Dữ liệu:", profileData);

    // kiểm tra dữ liệu trước khi gọi stored procedure
    if (
      experience_years !== undefined &&
      (experience_years < 0 || experience_years > 50)
    ) {
      throw new Error("Số năm kinh nghiệm phải từ 0-50");
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      throw new Error("Số điện thoại phải có 10-11 chữ số");
    }

    if (name && (name.length < 2 || name.length > 255)) {
      throw new Error("Họ tên phải từ 2-255 ký tự");
    }

    // gọi stored procedure để cập nhật
    const query = `
      EXEC sp_UpdateTutorInfo
        @TutorUserId = :userId,
        @name = :name,
        @dateOfBirth = :dateOfBirth,
        @phone = :phone,
        @locationDetail = :locationDetail,
        @address_id = :address_id,
        @introduction = :introduction,
        @experience_years = :experience_years,
        @specialties = :specialties
    `;
    await sequelize.query(query, {
      replacements: {
        userId,
        name: name || null,
        dateOfBirth: dateOfBirth || null,
        phone: phone || null,
        locationDetail: locationDetail || null,
        address_id: address_id || null,
        introduction: introduction || null,
        experience_years: experience_years || null,
        specialties: specialties || null,
      },
    });

    console.log("✅ [updateTutorProfile] Profile updated in database");

    //lấy lại thông tin profile sau khi cập nhật
    return await getTutorProfile(userId);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật thông tin gia sư", error);
    throw new Error(error.message || "Lỗi khi cập nhật thông tin gia sư");
  }
};

module.exports = {
  getTutorProfile,
  updateTutorProfile,
};

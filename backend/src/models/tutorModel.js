/**
 * Mục đích: Service layer cho Tutor profile management
 * Vai trò:
 *   - Xử lý business logic cho CRUD operations của tutor profile
 *   - Tương tác với SQL Server database thông qua stored procedures
 */

const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");

/**
 * Lấy thông tin profile của gia sư (sử dụng view tutor_info - có đầy đủ info địa điểm)
 */
const getTutorProfile = async (tutorId) => {
  try {
    console.log(`🔍 [getTutorProfile] Fetching for user ID: ${tutorId}`);

    // Query từ view tutor_info - đã JOIN với User, Ward, Province
    const query = `SELECT 
        tutor_id,
        user_id,
        email,
        fullName,
        phone,
        dateOfBirth,
        age,
        introduction,
        experienceYears,
        teachingStyle,
        specialties,
        verified,
        locationDetail,
        ward_id,
        ward_name,
        province_id,
        province_name,
        created_at,
        updated_at
      FROM tutor_info 
      WHERE user_id = :tutorId`;

    const results = await sequelize.query(query, {
      replacements: { tutorId },
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
const updateTutorProfile = async (tutorId, profileData) => {
  try {
    const {
      fullName,
      dateOfBirth,
      phone,
      wardId,
      locationDetail,
      introduction,
      experienceYears,
      teachingStyle,
      specialties,
    } = profileData;

    console.log("📝 [updateTutorProfile] Received data:", {
      fullName,
      phone,
      wardId,
      locationDetail,
      experienceYears,
    });

    // kiểm tra dữ liệu trước khi gọi stored procedure
    if (
      experienceYears !== undefined &&
      (experienceYears < 0 || experienceYears > 50)
    ) {
      throw new Error("Số năm kinh nghiệm phải từ 0-50");
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      throw new Error("Số điện thoại phải có 10-11 chữ số");
    }

    if (fullName && (fullName.length < 2 || fullName.length > 255)) {
      throw new Error("Họ tên phải từ 2-255 ký tự");
    }

    // gọi stored procedure để cập nhật
    const query = `
      EXEC sp_UpdateTutorInfo
        @TutorUserId = :tutorId,
        @FullName = :fullName,
        @DateOfBirth = :dateOfBirth,
        @Phone = :phone,
        @WardId = :wardId,
        @LocationDetail = :locationDetail,
        @Introduction = :introduction,
        @ExperienceYears = :experienceYears,
        @TeachingStyle = :teachingStyle,
        @Specialties = :specialties
    `;
    await sequelize.query(query, {
      replacements: {
        tutorId,
        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
        phone: phone || null,
        wardId: wardId || null,
        locationDetail: locationDetail || null,
        introduction: introduction || null,
        experienceYears: experienceYears || null,
        teachingStyle: teachingStyle || null,
        specialties: specialties || null,
      },
    });

    console.log("✅ [updateTutorProfile] Profile updated in database");

    //lấy lại thông tin profile sau khi cập nhật
    return await getTutorProfile(tutorId);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật thông tin gia sư", error);
    throw new Error(error.message || "Lỗi khi cập nhật thông tin gia sư");
  }
};

/**
 * Lấy danh sách tỉnh/thành phố
 */
const getProvinces = async () => {
  try {
    console.log("📍 [getProvinces] Fetching provinces...");

    const query = `
      SELECT id, name 
      FROM Province_Id 
      ORDER BY name
    `;
    const provinces = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    console.log(`✅ [getProvinces] Found ${provinces.length} provinces`);
    return provinces;
  } catch (error) {
    console.error("❌ [getProvinces] Error:", error.message);
    throw new Error(error.message || "Lỗi khi lấy danh sách tỉnh");
  }
};

/**
 * Lấy danh sách huyện theo tỉnh
 */
const getWardsByProvince = async (provinceId) => {
  try {
    console.log(
      `📍 [getWardsByProvince] Fetching wards for province: ${provinceId}`
    );

    const query = `
      SELECT 
        w.id,
        w.name,
        w.province_id,
        p.name as province_name
      FROM Ward w
      JOIN Province_Id p ON w.province_id = p.id
      WHERE w.province_id = :provinceId
      ORDER BY w.name
    `;
    const wards = await sequelize.query(query, {
      replacements: { provinceId },
      type: QueryTypes.SELECT,
    });

    console.log(`✅ [getWardsByProvince] Found ${wards.length} wards`);
    return wards;
  } catch (error) {
    console.error("❌ [getWardsByProvince] Error:", error.message);
    throw new Error(error.message || "Lỗi khi lấy danh sách huyện");
  }
};

/**
 * Lấy thống kê của gia sư
 */
/**
const getTutorStatistics = async (tutorUserId) => {
  try {
    // Lấy tutor_id từ user_id
    const tutorQuery = `
      SELECT id FROM Tutor WHERE user_id = :tutorUserId
    `;
    
    const [tutorResult] = await sequelize.query(tutorQuery, {
      replacements: { tutorUserId },
      type: QueryTypes.SELECT
    });

    if (!tutorResult) {
      throw new Error('Không tìm thấy thông tin gia sư');
    }

    const tutorId = tutorResult.id;

    // Thống kê các đơn ứng tuyển
    const applicationsStatsQuery = `
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn_count,
        SUM(CASE WHEN isConfirmed = 1 THEN 1 ELSE 0 END) as confirmed_count,
        SUM(CASE WHEN isConfirmed = 0 THEN 1 ELSE 0 END) as declined_count
      FROM Applications 
      WHERE tutor_id = :tutorId
    `;

    const [applicationsStats] = await sequelize.query(applicationsStatsQuery, {
      replacements: { tutorId },
      type: QueryTypes.SELECT
    });

    // Thống kê các lớp đã dạy
    const classesStatsQuery = `
      SELECT 
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'has_tutor' THEN 1 ELSE 0 END) as assigned_classes,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_classes,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_classes
      FROM Class 
      WHERE tutor_id = :tutorId
    `;

    const [classesStats] = await sequelize.query(classesStatsQuery, {
      replacements: { tutorId },
      type: QueryTypes.SELECT
    });

    // Tính phần trăm hoàn thành profile
    const profileCompletenessQuery = `
      SELECT 
        CASE 
          WHEN fullName IS NOT NULL THEN 10 ELSE 0 END +
        CASE 
          WHEN dateOfBirth IS NOT NULL THEN 10 ELSE 0 END +
        CASE 
          WHEN phone IS NOT NULL THEN 15 ELSE 0 END +
        CASE 
          WHEN address_id IS NOT NULL THEN 15 ELSE 0 END +
        CASE 
          WHEN introduction IS NOT NULL THEN 20 ELSE 0 END +
        CASE 
          WHEN experienceYears IS NOT NULL THEN 10 ELSE 0 END +
        CASE 
          WHEN teachingStyle IS NOT NULL THEN 10 ELSE 0 END +
        CASE 
          WHEN specialties IS NOT NULL THEN 10 ELSE 0 END as completeness_percentage
      FROM tutor_info
      WHERE user_id = :tutorUserId
    `;

    const [profileStats] = await sequelize.query(profileCompletenessQuery, {
      replacements: { tutorUserId },
      type: QueryTypes.SELECT
    });

    return {
      applications: applicationsStats || { total_applications: 0, applied_count: 0, approved_count: 0, rejected_count: 0, withdrawn_count: 0, confirmed_count: 0, declined_count: 0 },
      classes: classesStats || { total_classes: 0, assigned_classes: 0, in_progress_classes: 0, completed_classes: 0 },
      profileCompleteness: profileStats?.completeness_percentage || 0,
      tutorId
    };
  } catch (error) {
    console.error('Error in getTutorStatistics:', error);
    throw new Error(error.message || 'Lỗi khi lấy thống kê gia sư');
  }
};
*/

module.exports = {
  getTutorProfile,
  updateTutorProfile,
  getProvinces,
  getWardsByProvince,
};

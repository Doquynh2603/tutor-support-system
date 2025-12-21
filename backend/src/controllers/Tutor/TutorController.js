/**
 * File: TutorController.js
 * Mục đích: Controller xử lý các request liên quan đến tutor
 * Vai trò: Business logic cho CRUD operations tutor profile
 */

const tutorModel = require("../../models/Tutor/tutorModel");

/**
 * Helper: Format response
 */
const responseFormatter = (success, message, data = null) => {
  return {
    success,
    message,
    ...(data && { data }),
  };
};

/**
 * @desc Lấy thông tin profile gia sư
 * @route GET /api/tutor/profile
 * @return {Object} Tutor profile
 */
const getTutorProfile = async (req, res) => {
  try {
    // Lấy user ID từ middleware protect
    const userId = req.user?.user_id;
    console.log("📥 [getTutorProfile] Request for user:", userId);

    if (!userId) {
      return res
        .status(400)
        .json(responseFormatter(false, "User ID không được cung cấp"));
    }

    // ✅ Model đã format subjects thành array objects {subject_id, name}
    const tutorProfile = await tutorModel.getTutorProfile(userId);

    if (!tutorProfile) {
      return res
        .status(404)
        .json(responseFormatter(false, "Thông tin gia sư không tồn tại"));
    }

    console.log("✅ [getTutorProfile] Profile fetched successfully");
    console.log("   - Subjects:", tutorProfile.subjects);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin profile thành công",
      data: tutorProfile, // ✅ Subjects đã là array objects từ model
    });
  } catch (error) {
    console.error("❌ [getTutorProfile] Error:", error.message);
    return res
      .status(500)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi server khi lấy thông tin profile"
        )
      );
  }
};

/**
 * @desc Cập nhật thông tin profile gia sư
 * @route PUT /api/tutor/profile
 * @body {
 *   name?: string,
 *   dateOfBirth?: date,
 *   phone?: string,
 *   locationDetail?: string,
 *   address_id?: uuid,
 *   introduction?: string,
 *   experience_years?: number,
 *   subjects?: string[] (array of subject_id)
 * }
 * @return {Object} Updated tutor profile
 */
const updateTutorProfile = async (req, res) => {
  try {
    // Lấy user ID từ middleware protect
    const userId = req.user?.user_id;

    if (!userId) {
      return res
        .status(400)
        .json(responseFormatter(false, "User ID không được cung cấp"));
    }

    console.log(`📝 [updateTutorProfile] Updating for user ID: ${userId}`);

    const {
      name,
      dateOfBirth,
      phone,
      locationDetail,
      address_id,
      introduction,
      experience_years,
      subjects, // ✅ Nhận array subject_id
    } = req.body;

    console.log("📨 Request body:", req.body);

    // ✅ Validate phone format
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res
        .status(400)
        .json(responseFormatter(false, "Số điện thoại phải có 10-11 chữ số"));
    }

    // ✅ Validate name length
    if (name && (name.length < 2 || name.length > 255)) {
      return res
        .status(400)
        .json(responseFormatter(false, "Họ tên phải từ 2-255 ký tự"));
    }

    // ✅ Validate introduction length
    if (introduction && introduction.length > 1000) {
      return res
        .status(400)
        .json(
          responseFormatter(false, "Giới thiệu không được vượt quá 1000 ký tự")
        );
    }

    // ✅ Validate experience_years
    if (
      experience_years !== undefined &&
      experience_years !== null &&
      (experience_years < 0 || experience_years > 60)
    ) {
      return res
        .status(400)
        .json(responseFormatter(false, "Số năm kinh nghiệm phải từ 0-60"));
    }

    // ✅ Convert subjects array to JSON string
    let subjectsJson = null;
    if (subjects !== undefined && subjects !== null) {
      if (!Array.isArray(subjects)) {
        return res
          .status(400)
          .json(responseFormatter(false, "subjects phải là array"));
      }

      if (subjects.length > 0) {
        // ✅ Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const invalidSubjects = subjects.filter(
          (id) => !uuidRegex.test(String(id))
        );

        if (invalidSubjects.length > 0) {
          console.warn("⚠️ Invalid subject IDs:", invalidSubjects);
          return res
            .status(400)
            .json(
              responseFormatter(
                false,
                `Subject IDs không hợp lệ: ${invalidSubjects.join(", ")}`
              )
            );
        }

        // ✅ Convert array to JSON string
        subjectsJson = JSON.stringify(subjects);
        console.log("✅ Subjects converted to JSON:", subjectsJson);
      } else {
        // ✅ Empty array
        subjectsJson = JSON.stringify([]);
        console.log("✅ Empty subjects array");
      }
    }

    // ✅ Build profile data
    const profileData = {
      name: name || null,
      dateOfBirth: dateOfBirth || null,
      phone: phone || null,
      locationDetail: locationDetail || null,
      address_id: address_id || null,
      introduction: introduction || null,
      experience_years:
        experience_years !== undefined ? parseInt(experience_years) : null,
      subjects_json: subjectsJson, // ✅ Pass JSON string
    };

    console.log(
      "📤 Calling tutorModel.updateTutorProfile with data:",
      profileData
    );

    // ✅ Model sẽ format subjects thành array objects {subject_id, name}
    const updatedProfile = await tutorModel.updateTutorProfile(
      userId,
      profileData
    );

    console.log("✅ [updateTutorProfile] Profile updated successfully");
    console.log("   - Updated subjects:", updatedProfile.subjects);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin profile thành công",
      data: updatedProfile, // ✅ Subjects đã là array objects từ model
    });
  } catch (error) {
    console.error("❌ [updateTutorProfile] Error:", error.message);
    console.error("   Stack:", error.stack);

    return res
      .status(400)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi khi cập nhật thông tin profile"
        )
      );
  }
};

module.exports = {
  getTutorProfile,
  updateTutorProfile,
};

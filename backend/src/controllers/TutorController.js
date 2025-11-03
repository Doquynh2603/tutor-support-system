/**
 * File: TutorController.js
 * Mục đích: Controller xử lý các request liên quan đến tutor
 * Vai trò: Business logic cho CRUD operations tutor profile
 */

const tutorModel = require("../models/tutorModel");

/**
 * @desc Lấy thông tin profile gia sư
 * @route GET /api/tutor/profile
 */
const getTutorProfile = async (req, res) => {
  try {
    // Lấy user ID từ middleware protect
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID không được cung cấp",
      });
    }

    console.log(`🔍 [getTutorProfile] Fetching for user ID: ${userId}`);

    // Dùng tutorModel.getTutorProfile
    const tutorProfile = await tutorModel.getTutorProfile(userId);

    console.log("✅ [getTutorProfile] Found tutor profile");
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin profile thành công",
      data: tutorProfile,
    });
  } catch (error) {
    console.error("❌ [getTutorProfile] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy thông tin profile",
    });
  }
};

/**
 * @desc Cập nhật thông tin profile gia sư
 * @route PUT /api/tutor/profile
 */
const updateTutorProfile = async (req, res) => {
  try {
    // Lấy user ID từ middleware protect
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID không được cung cấp",
      });
    }

    console.log(`📝 [updateTutorProfile] Updating for user ID: ${userId}`);
    console.log("   - Data:", req.body);

    // Dùng tutorModel.updateTutorProfile
    const updatedProfile = await tutorModel.updateTutorProfile(
      userId,
      req.body
    );

    console.log("✅ [updateTutorProfile] Profile updated successfully");
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin profile thành công",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("❌ [updateTutorProfile] Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật thông tin profile",
    });
  }
};

/**
 * @desc Test database connection
 * @route GET /api/tutor/test-db
 */
const testDatabase = async (req, res) => {
  try {
    console.log("🧪 [testDatabase] Testing database connection...");

    // Thử lấy tỉnh/thành phố
    const { provinces } = await tutorModel.getAllLocations();

    console.log(
      `✅ [testDatabase] Connected! Found ${provinces.length} provinces`
    );
    return res.status(200).json({
      success: true,
      message: "Database connection successful",
      data: {
        provincesCount: provinces.length,
      },
    });
  } catch (error) {
    console.error("❌ [testDatabase] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed: " + error.message,
    });
  }
};

module.exports = {
  getTutorProfile,
  updateTutorProfile,
  testDatabase,
};

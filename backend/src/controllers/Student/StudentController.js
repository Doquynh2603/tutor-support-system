/**
 * File: StudentController.js
 * Mục đích: Controller xử lý các request liên quan đến học sinh
 * Vai trò: Business logic cho CRUD operations student profile
 */

const studentModel = require("../../models/Student/studentModel");
/**
 * @desc Lấy thông tin profile học sinh
 * @route GET /api/student/profile
 */

const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID không được cung cấp",
      });
    }
    console.log(`🔍 [getStudentProfile] Lấy thông tin cho user ID: ${userId}`);

    // Gọi model để lấy thông tin học sinh
    const studentProfile = await studentModel.getStudentProfile(userId);

    res.status(200).json({
      success: true,
      data: studentProfile,
      message: "Lấy thông tin profile học sinh thành công",
    });
  } catch (error) {
    console.error(
      "❌ [getStudentProfile] Lỗi khi lấy thông tin profile học sinh:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin profile học sinh",
    });
  }
};

/**
 * @desc Cập nhật thông tin profile học sinh
 * @route PUT /api/student/profile
 */

const updateStudentProfile = async (req, res) => {
  try {
    // Lấy user ID từ middleware protect
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID không được cung cấp",
      });
    }
    console.log(`📝 [updateStudentProfile] Cập nhật cho user ID: ${userId}`);
    console.log("   - Dữ liệu:", req.body);

    // cập nhật profile học sinh
    const updatedProfile = await studentModel.updateStudentProfile(
      userId,
      req.body
    );

    console.log(
      "✅ [updateStudentProfile] Cập nhật thành công",
      updatedProfile
    );
    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: "Cập nhật thông tin profile học sinh thành công",
    });
  } catch (error) {
    console.error(
      "❌ [updateStudentProfile] Lỗi khi cập nhật thông tin profile học sinh:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin profile học sinh",
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
};

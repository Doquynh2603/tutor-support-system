/**
 * File: controllers/tutorClassController.js
 * Mục đích: Controller cho quản lý danh sách lớp học của gia sư
 * Vai trò:
 *   - Lấy danh sách lớp học gia sư (đang dạy, ứng tuyển, được duyệt)
 *   - Lấy chi tiết thông tin lớp học
 *   - Lấy thông tin học viên của lớp
 */

const ClassModel = require("../../models/Tutor/ClassModel");

/**
 * Lấy danh sách lớp học của gia sư theo trạng thái
 * @param status: 'in_progress' (đang dạy), 'has_tutor' (được duyệt), 'recruiting' (đang tuyển)
 */
exports.getTutorClasses = async (req, res) => {
  try {
    const tutorUserId = req.user.user_id;
    const { status } = req.query;

    console.log(
      `📚 [getTutorClasses] Fetching tutor classes. User: ${tutorUserId}, Status: ${status}`
    );

    const classes = await ClassModel.getTutorClasses(tutorUserId, status);

    console.log(
      `✅ [getTutorClasses] Found ${classes.length} classes with status: ${
        status || "all"
      }`
    );
    console.log("Class lấy được từ database", classes);

    res.status(200).json({
      success: true,
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    console.error("❌ [getTutorClasses] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách lớp học",
    });
  }
};

/**
 * Lấy chi tiết thông tin của 1 lớp học
 */
exports.getTutorClassDetail = async (req, res) => {
  try {
    const tutorUserId = req.user.user_id;
    const { classId } = req.params;

    console.log(
      `📚 [getTutorClassDetail] Fetching class ${classId} for tutor ${tutorUserId}`
    );

    const classDetail = await ClassModel.getClassDetail(classId, tutorUserId);

    console.log(`✅ [getTutorClassDetail] Found class:`, classDetail);

    res.status(200).json({
      success: true,
      data: classDetail,
    });
  } catch (error) {
    console.error("❌ [getTutorClassDetail] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy chi tiết lớp học",
    });
  }
};

/**
 * Lấy thông tin profile học viên của lớp học
 */
exports.getClassStudentProfile = async (req, res) => {
  try {
    const tutorUserId = req.user.user_id;
    const { classId } = req.params;

    console.log(
      `👤 [getClassStudentProfile] Fetching student profile for class ${classId}`
    );

    const studentProfile = await ClassModel.getStudentByClass(
      classId,
      tutorUserId
    );

    console.log(
      `✅ [getClassStudentProfile] Found student profile:`,
      studentProfile
    );

    res.status(200).json({
      success: true,
      data: studentProfile,
    });
  } catch (error) {
    console.error("❌ [getClassStudentProfile] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin học viên",
    });
  }
};

// ✅ getTutorApplications REMOVED - Xử lý bởi /api/applications routes thay vào

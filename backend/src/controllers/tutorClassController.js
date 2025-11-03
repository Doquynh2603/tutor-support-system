/**
 * File: controllers/tutorClassController.js
 * Mục đích: Controller cho quản lý danh sách lớp học của gia sư
 * Vai trò:
 *   - Lấy danh sách lớp học gia sư (đang dạy, ứng tuyển, được duyệt)
 *   - Lấy chi tiết thông tin lớp học
 *   - Lấy thông tin học viên của lớp
 */

const ClassModel = require("../models/ClassModel");

/**
 * Lấy danh sách lớp học của gia sư theo trạng thái
 * @param status: 'in_progress' (đang dạy), 'has_tutor' (được duyệt), 'recruiting' (đang tuyển)
 */
exports.getTutorClasses = async (req, res) => {
  try {
    const tutorUserId = req.user.id; // Từ JWT token (protect middleware)
    const { status } = req.query; // recruiting, has_tutor, in_progress, completed

    console.log(
      `📚 [getTutorClasses] Fetching tutor classes. User: ${tutorUserId}, Status: ${status}`
    );

    // Sử dụng ClassModel để lấy dữ liệu
    const classes = await ClassModel.getTutorClasses(tutorUserId, status);

    console.log(
      `✅ [getTutorClasses] Found ${classes.length} classes with status: ${
        status || "all"
      }`
    );

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
    const tutorUserId = req.user.id;
    const { classId } = req.params;

    console.log(
      `📚 [getTutorClassDetail] Fetching class ${classId} for tutor ${tutorUserId}`
    );

    // Sử dụng ClassModel để lấy dữ liệu
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
    const tutorUserId = req.user.id;
    const { classId } = req.params;

    console.log(
      `👤 [getClassStudentProfile] Fetching student profile for class ${classId}`
    );

    // Sử dụng ClassModel để lấy dữ liệu
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

/**
 * Lấy danh sách ứng tuyển của gia sư (Applications)
 */
exports.getTutorApplications = async (req, res) => {
  try {
    const tutorUserId = req.user.id;
    const { status } = req.query; // applied, approved, rejected, withdrawn

    console.log(
      `📋 [getTutorApplications] Fetching applications for tutor ${tutorUserId}`
    );

    // Sử dụng ClassModel để lấy dữ liệu
    const applications = await ClassModel.getTutorApplications(
      tutorUserId,
      status
    );

    console.log(
      `✅ [getTutorApplications] Found ${applications.length} applications`
    );

    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("❌ [getTutorApplications] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách ứng tuyển",
    });
  }
};

// ✅ Các hàm đã được export bằng exports.xxx ở trên

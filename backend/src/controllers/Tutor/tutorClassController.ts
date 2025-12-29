/**
 * File: controllers/tutorClassController.js
 * Mục đích: Controller cho quản lý danh sách lớp học của gia sư
 * Vai trò:
 *   - Lấy danh sách lớp học gia sư (đang dạy, ứng tuyển, được duyệt)
 *   - Lấy chi tiết thông tin lớp học
 *   - Lấy thông tin học viên của lớp
 */

import { Request, Response } from "express";
import ClassModel from "../../models/Tutor/ClassModel";
import { responseFormatter } from "../../utils/responseFormatter";
import type {
  ClassListItem,
  ClassDetail,
  StudentInfo,
} from "../../models/Tutor/ClassModel";

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
}
/**
 * Lấy danh sách lớp học của gia sư theo trạng thái
 * @param status: 'in_progress' (đang dạy), 'has_tutor' (được duyệt), 'recruiting' (đang tuyển)
 */
const getTutorClasses = async (
  req: Request<never, never, never, { status?: string }>,
  res: Response
): Promise<void> => {
  try {
    console.log("📚 [getTutorClasses] Called");

    const tutorUserId = (req as AuthRequest).user?.user_id;
    const { status } = req.query;

    if (!tutorUserId) {
      res
        .status(401)
        .json(responseFormatter(false, "Không được phép truy cập"));
      return;
    }

    console.log(
      `📚 [getTutorClasses] Tutor: ${tutorUserId}, Status: ${status || "all"}`
    );

    const classes = await ClassModel.getTutorClasses(
      tutorUserId,
      (status as string) || null
    );

    console.log(
      `✅ [getTutorClasses] Found ${classes.length} classes with status: ${
        status || "all"
      }`
    );
    console.log("Class lấy được từ database", classes);

    res
      .status(200)
      .json(responseFormatter(classes, "Lấy danh sách lớp học thành công"));
  } catch (error: any) {
    console.error("❌ [getTutorClasses] Error:", error.message);
    res
      .status(500)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi khi lấy danh sách lớp học"
        )
      );
  }
};

/**
 * Lấy chi tiết thông tin của 1 lớp học
 */
const getTutorClassDetail = async (
  req: Request<{ classId: string }>,
  res: Response
): Promise<void> => {
  try {
    const tutorUserId = (req as AuthRequest).user?.user_id;
    const { classId } = req.params;

    if (!tutorUserId) {
      res
        .status(401)
        .json(responseFormatter(false, "Không được phép truy cập"));
      return;
    }

    if (!classId) {
      res
        .status(400)
        .json(responseFormatter(false, "Vui lòng cung cấp class_id"));
      return;
    }

    console.log(
      `📚 [getTutorClassDetail] Class: ${classId}, Tutor: ${tutorUserId}`
    );

    const classDetail = await ClassModel.getClassDetail(classId, tutorUserId);

    console.log(`✅ [getTutorClassDetail] Found class:`, classDetail);
    console.log(`✅ [getTutorClassDetail] Found class detail`);
    // 🔒 Privacy Check: Only show student info if class status is allowed
    // Allowed statuses: has_tutor, active, completed
    const modifiedDetail = { ...classDetail } as any;
    const allowedStatuses = ["has_tutor", "active", "completed"];
    if (!allowedStatuses.includes(modifiedDetail.status)) {
      delete modifiedDetail.student_name;
      delete modifiedDetail.student_phone;
      delete modifiedDetail.student_email;
      delete modifiedDetail.student_location;
      delete modifiedDetail.student_dob;
    }

    res
      .status(200)
      .json(
        responseFormatter(modifiedDetail, "Lấy chi tiết lớp học thành công")
      );
  } catch (error: any) {
    console.error("❌ [getTutorClassDetail] Error:", error.message);
    res
      .status(500)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi khi lấy chi tiết lớp học"
        )
      );
  }
};

/**
 * Lấy thông tin profile học viên của lớp học
 */
const getClassStudentProfile = async (
  req: Request<{ classId: string }>,
  res: Response
): Promise<void> => {
  try {
    console.log("👤 [getClassStudentProfile] Called");
    const tutorUserId = (req as AuthRequest).user?.user_id;
    const { classId } = req.params;

    if (!tutorUserId) {
      res
        .status(401)
        .json(responseFormatter(false, "Không được phép truy cập"));
      return;
    }

    if (!classId) {
      res
        .status(400)
        .json(responseFormatter(false, "Vui lòng cung cấp class_id"));
      return;
    }

    console.log(
      `👤 [getClassStudentProfile] Class: ${classId}, Tutor: ${tutorUserId}`
    );

    const studentProfile = await ClassModel.getStudentByClass(
      classId,
      tutorUserId
    );

    console.log(
      `✅ [getClassStudentProfile] Found student profile:`,
      studentProfile
    );

    res
      .status(200)
      .json(
        responseFormatter(studentProfile, "Lấy thông tin học viên thành công")
      );
  } catch (error: any) {
    console.error("❌ [getClassStudentProfile] Error:", error.message);
    res
      .status(500)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi khi lấy thông tin học viên"
        )
      );
  }
};
export default {
  getTutorClasses,
  getTutorClassDetail,
  getClassStudentProfile,
};
// ✅ getTutorApplications REMOVED - Xử lý bởi /api/applications routes thay vào

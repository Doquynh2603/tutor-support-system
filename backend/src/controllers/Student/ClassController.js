// backend/src/controllers/Student/ClassController.js
/**
 * File: ClassController.js
 * Mục đích: Xử lý HTTP requests cho quản lý lớp học
 * Logic: Gọi model để lấy data, format response
 */

const ClassModel = require("../../models/Student/classModel");
const { responseFormatter } = require("../../utils/responseFormatter");

class ClassController {
  // =====================================================
  // 1. TẠO LỚP HỌC
  // =====================================================
  static async createClass(req, res) {
    try {
      const { subject_id, description, requirement, hourly_price, schedules } =
        req.body;
      const student_user_id = req.user.user_id;

      // ✅ Validation
      if (
        !subject_id ||
        !description ||
        !hourly_price ||
        !Array.isArray(schedules) ||
        schedules.length === 0
      ) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Vui lòng điền đầy đủ: subject_id, description, hourly_price, schedules"
            )
          );
      }

      // ✅ Validate schedules - Fix: day_of_week có thể là 0 (Chủ nhật)
      const invalidSchedules = schedules.some(
        (s) =>
          s.day_of_week === undefined ||
          s.day_of_week === null ||
          !s.start_date ||
          !s.end_date ||
          s.duration_minutes === undefined ||
          s.duration_minutes === null
      );

      if (invalidSchedules) {
        console.error("❌ Invalid schedule:", schedules);
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Lịch học không hợp lệ. Mỗi lịch phải có: day_of_week, start_date, end_date, duration_minutes"
            )
          );
      }

      // ✅ Parse schedules to JSON
      const schedulesJson = JSON.stringify(schedules);

      // ✅ Call model
      const classId = await ClassModel.createClass(
        student_user_id,
        subject_id,
        description,
        requirement,
        hourly_price,
        schedulesJson
      );

      return res.status(201).json(
        responseFormatter(
          {
            class_id: classId,
            status: "recruiting",
          },
          "Tạo lớp học thành công"
        )
      );
    } catch (error) {
      console.error("Error creating class:", error);
      return res
        .status(500)
        .json(
          responseFormatter(false, "Lỗi khi tạo lớp học: " + error.message)
        );
    }
  }

  // =====================================================
  // 2. MỜI 1 GIA SƯ
  // =====================================================
  static async inviteSingleTutor(req, res) {
    try {
      const { class_id } = req.params; // ✅ Từ URL path
      const { tutor_id } = req.body; // ✅ Từ body
      const student_user_id = req.user.user_id;

      // ✅ Validation
      if (!class_id || !tutor_id) {
        return res
          .status(400)
          .json(
            responseFormatter(false, "Vui lòng cung cấp class_id và tutor_id")
          );
      }

      // ✅ Call model (SP sẽ validate)
      const result = await ClassModel.inviteSingleTutor(
        class_id,
        tutor_id,
        student_user_id
      );

      return res.status(200).json(
        responseFormatter(
          {
            class_id,
            tutor_id,
            status: "invited",
          },
          result.message
        )
      );
    } catch (error) {
      console.error("Error inviting tutor:", error);
      return res.status(500).json(responseFormatter(false, error.message));
    }
  }

  // =====================================================
  // 3. DUYỆT ỨNG TUYỂN
  // =====================================================
  static async approveApplication(req, res) {
    try {
      const { class_id } = req.params; // ✅ Từ URL path
      const { application_id } = req.body;
      const student_user_id = req.user.user_id;

      if (!application_id) {
        return res
          .status(400)
          .json(responseFormatter(false, "Vui lòng cung cấp application_id"));
      }

      // ✅ Call model
      const result = await ClassModel.approveApplication(
        application_id,
        student_user_id
      );

      return res.status(200).json(
        responseFormatter(
          {
            class_id,
            application_id,
            is_locked: true,
          },
          result.message
        )
      );
    } catch (error) {
      console.error("Error approving application:", error);
      return res.status(500).json(responseFormatter(false, error.message));
    }
  }

  // =====================================================
  // 4. LẤY DANH SÁCH LỚP CỦA HỌC VIÊN
  // =====================================================
  static async getStudentClasses(req, res) {
    try {
      const student_user_id = req.user.user_id;
      const { status } = req.query;
      // ✅ Call model
      const classes = await ClassModel.getStudentClasses(
        student_user_id,
        status
      );

      return res
        .status(200)
        .json(responseFormatter(classes, "Danh sách lớp học của học viên"));
    } catch (error) {
      console.error("Error getting student classes:", error);
      return res
        .status(500)
        .json(
          responseFormatter(
            false,
            "Lỗi khi lấy danh sách lớp học: " + error.message
          )
        );
    }
  }

  // =====================================================
  // 5. LẤY CHI TIẾT LỚP HỌC
  // =====================================================
  static async getClassDetails(req, res) {
    try {
      const { class_id } = req.params;
      const student_user_id = req.user.user_id;

      if (!class_id) {
        return res
          .status(400)
          .json(responseFormatter(false, "Vui lòng cung cấp class_id"));
      }

      // ✅ Call model
      const classData = await ClassModel.getClassDetails(
        class_id,
        student_user_id
      );
      console.log(
        "dữ liệu backend chi tiết lớp lấy được từ database",
        classData
      );

      return res
        .status(200)
        .json(responseFormatter(classData, "Chi tiết lớp học"));
    } catch (error) {
      console.error("Error getting class details:", error);

      if (error.message.includes("không tồn tại")) {
        return res
          .status(404)
          .json(responseFormatter(false, "Lớp học không tồn tại"));
      }

      return res
        .status(500)
        .json(
          responseFormatter(
            false,
            "Lỗi khi lấy chi tiết lớp học: " + error.message
          )
        );
    }
  }

  // =====================================================
  // 6. LẤY DANH SÁCH GIA SƯ GỢI Ý
  // =====================================================
  static async getSuggestedTutors(req, res) {
    try {
      const { subject_id } = req.query;

      if (!subject_id) {
        return res
          .status(400)
          .json(responseFormatter(false, "Vui lòng cung cấp subject_id"));
      }

      // ✅ Call model
      const tutors = await ClassModel.getSuggestedTutors(subject_id);

      return res
        .status(200)
        .json(responseFormatter(tutors, "Danh sách gia sư gợi ý"));
    } catch (error) {
      console.error("Error getting suggested tutors:", error);
      return res
        .status(500)
        .json(
          responseFormatter(
            false,
            "Lỗi khi lấy danh sách gia sư: " + error.message
          )
        );
    }
  }
  // =====================================================
  // 7. PHỤ HUYNH SỬA THÔNG TIN LỚP HỌC
  // =====================================================
  static async updateClass(req, res) {
    try {
      const { class_id } = req.params;
      const student_user_id = req.user.user_id;
      const { description, requirement, hourly_price } = req.body;

      if (!hourly_price) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Vui lòng cung cấp đầy đủ thông tin bắt buộc: subject_id, hourly_price"
            )
          );
      }

      const result = await ClassModel.updateClassInfo(
        class_id,
        student_user_id,
        { description, requirement, hourly_price }
      );

      // lấy danh sách gia sư ứng tuyển/được mời để thông báo
      const tutors = await ClassModel.getApplicationTutors(class_id);
      console.log(`📢 Notifying ${tutors.length} tutors about class update`);
      // TODO: Gửi notification (websocket, email, hoặc database notification table)
      // for (const tutor of tutors) {
      //   await notificationService.send({
      //     userId: tutor.user_id,
      //     message: `Lớp học "${class_id}" vừa được cập nhật thông tin`,
      //     type: 'CLASS_UPDATED'
      //   });
      // }

      return res
        .status(200)
        .json(
          responseFormatter(result, "Cập nhật thông tin lớp học thành công")
        );
    } catch (error) {
      console.error("Error updating class:", error);
      return res
        .status(500)
        .json(
          responseFormatter(false, error.message || "Lỗi khi cập nhật lớp học")
        );
    }
  }
  // =====================================================
  // 8. HỦY LỚP HỌC
  // =====================================================
  static async cancelClass(req, res) {
    try {
      const { class_id } = req.params;
      const student_user_id = req.user.user_id;
      const { cancellation_reason } = req.body;
      console.log(`🗑️ [cancelClass] Attempting to cancel class: ${class_id}`);

      if (!cancellation_reason || cancellation_reason.trim() === "") {
        return res
          .status(400)
          .json(responseFormatter(false, "Lý do hủy lớp là bắt buộc"));
      }
      // hủy lớp học
      const result = await ClassModel.cancelClass(
        class_id,
        student_user_id,
        cancellation_reason
      );
      return res
        .status(200)
        .json(responseFormatter(result, "Hủy lớp học thành công"));
    } catch (error) {
      console.error("Error cancelling class:", error);
      return res
        .status(500)
        .json(responseFormatter(false, error.message || "Lỗi khi hủy lớp học"));
    }
  }
  // =====================================================
  // 9. LẤY DANH SÁCH GIA SƯ ỨNG TUYỂN CHO 1 LỚP
  // =====================================================
  static async getApplicationsByClass(req, res) {
    try {
      const { class_id } = req.params;
      const student_user_id = req.user.user_id;
      console.log(
        `📋 [getApplicationsByClass] Fetching tutors for class ${class_id}`
      );
      if (!class_id) {
        return res
          .status(400)
          .json(responseFormatter(false, "Vui lòng cung cấp class_id"));
      }

      //lấy danh sách gia sư ứng tuyển
      const applications = await ClassModel.getApplicationsByClass(
        class_id,
        student_user_id
      );

      console.log(
        `✅ [getApplicationsByClass] Found applications:`,
        applications
      );

      //lấy lịch của lớp
      const classSchedules = await ClassModel.getClassSchedules(class_id);

      // kiểm tra lịch trùng và filter
      const applicationWithConflict = applications.map((app) => {
        const tutorSchedules = applications
          .filter((a) => a.tutor_id === app.tutor_id)
          .map((a) => ({
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
          }))
          .filter((s) => s.day_of_week !== null);
        const hasConflict = ClassModel.checkScheduleConflict(
          classSchedules,
          tutorSchedules
        );
        return {
          ...app,
          schedule_conflict: hasConflict,
        };
      });
      return res
        .status(200)
        .json(
          responseFormatter(
            applicationWithConflict,
            "Lấy danh sách gia sư ứng tuyển thành công"
          )
        );
    } catch (error) {
      console.error("❌ [getApplicationsByClass] Error:", error.message);
      return res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi lấy danh sách gia sư"
          )
        );
    }
  }
  // =====================================================
  // 10. LẤY CHI TIẾT GIA SƯ
  // =====================================================
  static async getTutorDetail(req, res) {
    try {
      const { tutor_id } = req.params;
      const { class_id } = req.body;
      const student_user_id = req.user.user_id;
      console.log("📥 getTutorDetail params:", {
        tutor_id,
        class_id,
        student_user_id,
      });
      console.log(
        `🔍 [getTutorDetail] Fetching tutor ${tutor_id} for class ${class_id}`
      );
      if (!tutor_id || !class_id) {
        return res
          .status(400)
          .json(
            responseFormatter(false, "Vui lòng cung cấp tutor_id và class_id")
          );
      }
      const tutorDetail = await ClassModel.getTutorDetailApproval(
        tutor_id,
        class_id,
        student_user_id
      );
      console.log(`✅ [getTutorDetail] Found tutor detail:`, tutorDetail);

      return res
        .status(200)
        .json(responseFormatter(tutorDetail, "Lấy chi tiết gia sư thành công"));
    } catch (error) {
      console.error("❌ [getTutorDetail] Error:", error.message);
      return res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi lấy chi tiết gia sư"
          )
        );
    }
  }
  // =====================================================
  // 11. DUYỆT/TỪ CHỐI GIA SƯ (GỘP)
  // =====================================================
  static async reviewApplication(req, res) {
    try {
      const { application_id, action, rejection_reason } = req.body;
      const student_user_id = req.user.user_id;

      console.log(
        `📝 [reviewApplication] Reviewing application ${application_id} with action ${action}`
      );
      // Validation
      if (!application_id || !action) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Vui lòng cung cấp application_id và action"
            )
          );
      }
      if (!["approve", "reject"].includes(action)) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              'Hành động không hợp lệ (phải là "approve" hoặc "reject")'
            )
          );
      }
      if (
        action === "reject" &&
        (!rejection_reason || rejection_reason.trim() === "")
      ) {
        return res
          .status(400)
          .json(responseFormatter(false, "Lý do từ chối là bắt buộc"));
      }
      const result = await ClassModel.reviewTutorApplication(
        application_id,
        student_user_id,
        action,
        rejection_reason
      );
      console.log(`✅ [reviewApplication] Review result:`, result);
      // TODO: Gửi notification đến gia sư
      // if (action === "approve") {
      //   await notificationService.notifyTutorApproved(application_id);
      // } else {
      //   await notificationService.notifyTutorRejected(application_id, rejection_reason);
      // }
      return res
        .status(200)
        .json(
          responseFormatter(
            result,
            action === "approve"
              ? "Duyệt gia sư thành công"
              : "Từ chối gia sư thành công"
          )
        );
    } catch (error) {
      console.error("❌ [reviewApplication] Error:", error.message);
      return res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi xử lý đơn ứng tuyển"
          )
        );
    }
  }
  // =====================================================
  // 12. DUYỆT GIA SƯ (giữ lại cho backward compatible)
  // =====================================================
  static async approveApplicationV2(req, res) {
    return ClassController.reviewApplication(
      {
        ...req,
        body: {
          ...req.body,
          action: "approve",
        },
      },
      res
    );
  }

  // =====================================================
  // 13. TỪ CHỐI GIA SƯ (giữ lại cho backward compatible)
  // =====================================================
  static async rejectApplication(req, res) {
    return ClassController.reviewApplication(
      {
        ...req,
        body: {
          ...req.body,
          action: "reject",
          rejection_reason: req.body.rejection_reason,
        },
      },
      res
    );
  }
}

module.exports = ClassController;

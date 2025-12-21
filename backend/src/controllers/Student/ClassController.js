// backend/src/controllers/Student/ClassController.js
/**
 * File: ClassController.js
 * Mục đích: Xử lý HTTP requests cho quản lý lớp học
 * Logic: Gọi model để lấy data, format response
 */

const ClassModel = require("../../models/Student/classModel");
const ClassService = require("../../service/ClassService");
const { responseFormatter } = require("../../utils/responseFormatter");

class ClassController {
  // =====================================================
  // 1. TẠO LỚP HỌC
  // =====================================================
  static async createClass(req, res) {
    try {
      const {
        subject_id,
        description,
        requirement,
        hourly_price,
        classLevel,
        start_date,
        end_date,
        schedules,
      } = req.body;
      const student_user_id = req.user.user_id;
      console.log("📥 [createClass] Request body:", {
        subject_id,
        description,
        requirement,
        hourly_price,
        classLevel,
        start_date,
        end_date,
        schedules,
      });
      // ✅ Validation
      if (
        !subject_id ||
        !hourly_price ||
        !classLevel ||
        !start_date ||
        !end_date ||
        !Array.isArray(schedules) ||
        schedules.length === 0
      ) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Vui lòng điền đầy đủ: subject_id, hourly_price, classLevel, start_date, end_date, schedules"
            )
          );
      }
      // ✅ VALIDATION 2: Kiểm tra định dạng ngày
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Định dạng ngày không hợp lệ. Vui lòng sử dụng format: YYYY-MM-DD"
            )
          );
      }

      if (startDate >= endDate) {
        return res
          .status(400)
          .json(
            responseFormatter(false, "Ngày bắt đầu phải nhỏ hơn ngày kết thúc")
          );
      }
      // ✅ VALIDATION 3: Kiểm tra lịch học
      const invalidSchedules = schedules.some((s) => {
        console.log("🔍 Checking schedule:", s);
        return (
          s.day_of_week === undefined ||
          s.day_of_week === null ||
          s.day_of_week < 1 ||
          s.day_of_week > 7 ||
          !s.start_time ||
          !s.end_time ||
          s.duration_minutes === undefined ||
          s.duration_minutes === null ||
          s.duration_minutes <= 0
        );
      });

      if (invalidSchedules) {
        console.error("❌ Invalid schedule:", schedules);
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Lịch học không hợp lệ. Mỗi lịch phải có:\n" +
                "- day_of_week: 1-7 (1=Thứ 2, 7=Chủ nhật)\n" +
                "- start_time: HH:MM (ví dụ: 09:00)\n" +
                "- end_time: HH:MM (ví dụ: 11:00)\n" +
                "- duration_minutes: > 0"
            )
          );
      }
      // ✅ VALIDATION 4: Kiểm tra thời gian lịch học
      const invalidTimes = schedules.some((s) => {
        const [startHour, startMin] = s.start_time.split(":").map(Number);
        const [endHour, endMin] = s.end_time.split(":").map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return startMinutes >= endMinutes;
      });

      if (invalidTimes) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Thời gian kết thúc phải lớn hơn thời gian bắt đầu"
            )
          );
      }
      // ✅ VALIDATION 5: Kiểm tra hourly_price
      if (hourly_price <= 0 || hourly_price > 9999999) {
        return res
          .status(400)
          .json(responseFormatter(false, "Học phí không hợp lệ (phải > 0)"));
      }

      // ✅ VALIDATION 6: Kiểm tra classLevel
      if (classLevel < 1 || classLevel > 12) {
        return res
          .status(400)
          .json(
            responseFormatter(false, "Cấp lớp không hợp lệ (phải từ 1 đến 12)")
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
        parseInt(hourly_price), // ✅ Parse to int
        parseInt(classLevel),
        start_date,
        end_date,
        schedulesJson
      );
      if (!classId) {
        throw new Error(
          "Tạo lớp học thất bại - Không nhận được class_id từ database"
        );
      }

      console.log("✅ [createClass] Class created successfully:", classId);
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

      // gọi service thay vì trực tiếp model
      // ✅ Call model (SP sẽ validate)
      const result = await ClassService.inviteSingleTutor(
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
  // static async approveApplication(req, res) {
  //   try {
  //     const { class_id } = req.params; // ✅ Từ URL path
  //     const { application_id } = req.body;
  //     const student_user_id = req.user.user_id;

  //     if (!application_id) {
  //       return res
  //         .status(400)
  //         .json(responseFormatter(false, "Vui lòng cung cấp application_id"));
  //     }

  //     // ✅ Call model
  //     const result = await ClassModel.approveApplication(
  //       application_id,
  //       student_user_id
  //     );

  //     return res.status(200).json(
  //       responseFormatter(
  //         {
  //           class_id,
  //           application_id,
  //           is_locked: true,
  //         },
  //         result.message
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error approving application:", error);
  //     return res.status(500).json(responseFormatter(false, error.message));
  //   }
  // }

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
      console.log(
        "dữ liệu danh sách lớp của học viên lấy được từ database: ",
        classes
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
      const { description, requirement, hourly_price, classLevel } = req.body;

      if (!hourly_price || !classLevel) {
        return res
          .status(400)
          .json(
            responseFormatter(
              false,
              "Vui lòng cung cấp đầy đủ thông tin bắt buộc: hourly_price, classLevel"
            )
          );
      }
      // gọi service thay vì trực tiếp model
      const result = await ClassService.updateClass(class_id, student_user_id, {
        description,
        requirement,
        hourly_price,
        classLevel,
      });

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
      // hủy lớp học-gọi service thay vì trực tiếp model
      const result = await ClassService.cancelClass(
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

      return res
        .status(200)
        .json(
          responseFormatter(
            applications,
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

      //gọi service thay vì trực tiếp model
      const result = await ClassService.reviewApplication(
        application_id,
        student_user_id,
        action,
        rejection_reason
      );
      console.log(`✅ [reviewApplication] Review result:`, result);
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
}

module.exports = ClassController;

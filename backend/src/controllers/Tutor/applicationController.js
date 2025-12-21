/**
 * File: backend/src/controllers/applicationController.js
 * Mục đích: Xử lý HTTP requests cho quản lý đơn ứng tuyển
 */

const ApplicationModel = require("../../models/Tutor/ApplicationModel");
const { sequelize } = require("../../config/sqlserver");
const { QueryTypes } = require("sequelize");
const ApplicationService = require("../../service/ApplicationService");

class ApplicationController {
  // lấy danh sách đơn ứng tuyển của gia sư(có lọc theo status)
  static async getTutorApplications(req, res) {
    try {
      console.log("📋 [applicationController.getTutorApplications] Called");

      //lấy tutor_id từ JWT token
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Không được phép truy cập. Vui lòng đăng nhập.",
        });
      }
      const status = req.query.status || null;
      // lấy danh sách đơn ứng tuyển
      const applications = await ApplicationModel.getTutorApplications(
        userId,
        status
      );
      console.log(
        `đơn ứng tuyển được lấy từ database theo status: ${status}`,
        applications
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách đơn ứng tuyển thành công",
        data: applications,
      });
    } catch (error) {
      console.error(
        "❌ [applicationController.getMyApplications]:",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi lấy danh sách đơn ứng tuyển",
      });
    }
  }

  // lấy chi tiết đơn ứng tuyển
  static async getApplicationById(req, res) {
    try {
      console.log("📋 [applicationController.getApplicationById] Called");

      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Không được phép truy cập. Vui lòng đăng nhập.",
        });
      }
      const { applicationId } = req.params;
      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu application ID",
        });
      }
      // gọi model để lấy chi tiết đơn ứng tuyển

      const applicationDetail = await ApplicationModel.getTutorApplicationById(
        userId,
        applicationId
      );
      console.log(
        "chi tiết đơn ứng tuyển của gia sư lấy được từ database",
        applicationDetail
      );

      return res.status(200).json({
        success: true,
        message: "Lấy chi tiết đơn ứng tuyển thành công",
        data: applicationDetail,
      });
    } catch (error) {
      console.error(
        "❌ [applicationController.getApplicationDetail]:",
        error.message
      );

      if (error.message.includes("Không tìm thấy")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết đơn ứng tuyển",
      });
    }
  }

  // rút đơn ứng tuyển
  static async withdrawApplication(req, res) {
    try {
      console.log("🚫 [applicationController.withdrawApplication] Called");

      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Không được phép truy cập. Vui lòng đăng nhập.",
        });
      }
      const { applicationId } = req.params;
      const { withdrawReason } = req.body;
      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu application ID",
        });
      }
      console.log(
        `🚫 Withdrawing application ${applicationId} for tutor ${userId}`
      );
      //gọi model để rút đơn ứng tuyển
      const result = await ApplicationModel.withdrawApplication(
        applicationId,
        userId,
        withdrawReason || null
      );
      return res.status(200).json({
        success: true,
        message: "Rút đơn ứng tuyển thành công",
        data: result,
      });
    } catch (error) {
      console.error(
        "❌ [applicationController.withdrawApplication]:",
        error.message
      );

      // Kiểm tra error từ stored procedure
      if (error.message.includes("không có quyền")) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi rút đơn ứng tuyển",
      });
    }
  }

  // xác nhận or từ chối lớp học
  static async confirmClass(req, res) {
    try {
      console.log("🤝 [applicationController.confirmApplication] Called");
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Không được phép truy cập. Vui lòng đăng nhập.",
        });
      }
      const { applicationId, isConfirmed, declineReason } = req.body;

      if (!applicationId || isConfirmed === undefined) {
        return res.status(400).json({
          success: false,
          message: "applicationId và isConfirmed là bắt buộc",
        });
      }
      console.log(
        `Xác nhận/Từ chối application ${applicationId} của tutor ${userId}`
      );

      // gọi model để xác nhận/từ chối lớp học
      const result = await ApplicationService.confirmApplication(
        userId,
        applicationId,
        isConfirmed,
        declineReason
      );
      console.log("Dữ liệu từ database khi gia sư confirmed lớp học: ", result);
      return res.status(200).json({
        success: true,
        message: isConfirmed
          ? "Xác nhận lớp học thành công"
          : "Từ chối lớp học thành công",
        data: result,
      });
    } catch (error) {
      console.error(
        "❌ [applicationController.confirmApplication]:",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi khi xác nhận/từ chối lớp học",
      });
    }
  }
}
module.exports = ApplicationController;

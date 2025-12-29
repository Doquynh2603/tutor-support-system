/**
 * File: backend/src/controllers/applicationController.js
 * Mục đích: Xử lý HTTP requests cho quản lý đơn ứng tuyển
 */

import { Request, Response } from "express";
import ApplicationModel from "../../models/Tutor/ApplicationModel";
import ApplicationService from "../../service/ApplicationService";
import { responseFormatter } from "../../utils/responseFormatter";
import type {
  ApplicationListItem,
  ApplicationDetail,
} from "../../models/Tutor/ApplicationModel";

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface ConfirmClassBody {
  applicationId: string;
  isConfirmed: boolean;
  declineReason?: string;
}

interface WithdrawApplicationBody {
  withdrawReason?: string;
}
class ApplicationController {
  // lấy danh sách đơn ứng tuyển của gia sư(có lọc theo status)
  static async getTutorApplications(
    req: Request<never, never, never, { status?: string }>,
    res: Response
  ): Promise<void> {
    try {
      console.log("📋 [applicationController.getTutorApplications] Called");

      //lấy tutor_id từ JWT token
      const userId = (req as AuthRequest).user?.user_id;
      if (!userId) {
        res
          .status(401)
          .json(
            responseFormatter(
              false,
              "Không được phép truy cập. Vui lòng đăng nhập."
            )
          );
        return;
      }
      const status = (req.query.status as string) || null;
      console.log(
        `📋 [getTutorApplications] Tutor: ${userId}, Status: ${status}`
      );
      // lấy danh sách đơn ứng tuyển
      const applications = await ApplicationModel.getTutorApplications(
        userId,
        status
      );
      console.log(
        `✅ [getTutorApplications] Found ${applications.length} applications`
      );
      console.log("📊 Dữ liệu ứng tuyển lấy từ database:", applications);
      res
        .status(200)
        .json(
          responseFormatter(
            applications,
            "Lấy danh sách đơn ứng tuyển thành công"
          )
        );
    } catch (error: any) {
      console.error(
        "❌ [applicationController.getMyApplications]:",
        error.message
      );
      res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi lấy danh sách đơn ứng tuyển"
          )
        );
    }
  }

  // lấy chi tiết đơn ứng tuyển
  static async getApplicationById(
    req: Request<{ applicationId: string }>,
    res: Response
  ): Promise<void> {
    try {
      console.log("📋 [applicationController.getApplicationById] Called");

      const userId = (req as AuthRequest).user?.user_id;
      if (!userId) {
        res
          .status(401)
          .json(
            responseFormatter(
              false,
              "Không được phép truy cập. Vui lòng đăng nhập."
            )
          );
        return;
      }
      const { applicationId } = req.params;
      if (!applicationId) {
        res.status(400).json(responseFormatter(false, "Thiếu application ID"));
        return;
      }

      console.log(
        `📋 [getApplicationById] Application: ${applicationId}, Tutor: ${userId}`
      );
      // gọi model để lấy chi tiết đơn ứng tuyển

      const applicationDetail = await ApplicationModel.getTutorApplicationById(
        userId,
        applicationId
      );
      if (!applicationDetail) {
        res
          .status(404)
          .json(responseFormatter(false, "Không tìm thấy đơn ứng tuyển"));
        return;
      }

      console.log(`✅ [getApplicationById] Found application`);
      console.log("📊 Chi tiết đơn ứng tuyển:", applicationDetail);
      // 🔒 Privacy Check: Only show student info if application is approved
      // Note: View_ApplicationDetail uses 'application_status' column, not 'status'
      const modifiedDetail = { ...applicationDetail } as any;

      if (modifiedDetail.status !== "approved") {
        delete modifiedDetail.student_name;
        delete modifiedDetail.student_phone;
        delete modifiedDetail.student_email;
        delete modifiedDetail.student_location;
      }
      // Keep generic location like district/province if available separately,
      // but if they are part of student_location, they are gone.
      // Usually views return ward_name, district_name separately. Let's check if we need to hide those.
      // Usually district/province is public info for the class location.

      res
        .status(200)
        .json(
          responseFormatter(
            modifiedDetail,
            "Lấy chi tiết đơn ứng tuyển thành công"
          )
        );
    } catch (error: any) {
      console.error(
        "❌ [applicationController.getApplicationDetail]:",
        error.message
      );

      if (error.message.includes("Không tìm thấy")) {
        res.status(404).json(responseFormatter(false, error.message));
        return;
      }
      res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi lấy chi tiết đơn ứng tuyển"
          )
        );
    }
  }

  // rút đơn ứng tuyển
  static async withdrawApplication(
    req: Request<{ applicationId: string }, never, WithdrawApplicationBody>,
    res: Response
  ): Promise<void> {
    try {
      console.log("🚫 [applicationController.withdrawApplication] Called");

      const userId = (req as AuthRequest).user?.user_id;
      if (!userId) {
        res
          .status(401)
          .json(
            responseFormatter(
              false,
              "Không được phép truy cập. Vui lòng đăng nhập."
            )
          );
        return;
      }
      const { applicationId } = req.params;
      const { withdrawReason } = req.body;
      if (!applicationId) {
        res.status(400).json(responseFormatter(false, "Thiếu application ID"));
        return;
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
      console.log(`✅ [withdrawApplication] Withdrawn successfully`);

      res
        .status(200)
        .json(responseFormatter(result, "Rút đơn ứng tuyển thành công"));
    } catch (error: any) {
      console.error(
        "❌ [applicationController.withdrawApplication]:",
        error.message
      );

      // Kiểm tra error từ stored procedure
      if (error.message.includes("không có quyền")) {
        res.status(403).json(responseFormatter(false, error.message));
        return;
      }

      res
        .status(500)
        .json(
          responseFormatter(false, error.message || "Lỗi khi rút đơn ứng tuyển")
        );
    }
  }

  // xác nhận or từ chối lớp học
  static async confirmClass(
    req: Request<never, never, ConfirmClassBody>,
    res: Response
  ): Promise<void> {
    try {
      console.log("🤝 [applicationController.confirmApplication] Called");
      const userId = (req as AuthRequest).user?.user_id;
      if (!userId) {
        res
          .status(401)
          .json(
            responseFormatter(
              false,
              "Không được phép truy cập. Vui lòng đăng nhập."
            )
          );
        return;
      }
      const { applicationId, isConfirmed, declineReason } = req.body;

      if (applicationId === undefined || isConfirmed === undefined) {
        res
          .status(400)
          .json(
            responseFormatter(false, "applicationId và isConfirmed là bắt buộc")
          );
        return;
      }
      console.log(
        `Xác nhận/Từ chối application ${applicationId} của tutor ${userId}`
      );

      // gọi model để xác nhận/từ chối lớp học
      const result = await ApplicationService.confirmApplication(
        userId,
        applicationId,
        isConfirmed,
        declineReason || null
      );
      console.log(`✅ [confirmClass] Success`);
      console.log("📊 Service response:", result);
      res
        .status(200)
        .json(
          responseFormatter(
            result,
            isConfirmed
              ? "Xác nhận lớp học thành công"
              : "Từ chối lớp học thành công"
          )
        );
    } catch (error: any) {
      console.error(
        "❌ [applicationController.confirmApplication]:",
        error.message
      );
      res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi xác nhận/từ chối lớp học"
          )
        );
    }
  }
}
export default ApplicationController;

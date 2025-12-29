/**
 * File: backend/src/routes/applicationRoutes.js
 * Mục đích: Routes cho quản lý đơn ứng tuyển
 * ✅ Thêm roleCheck('tutor')
 */

import { Router } from "express";
import protect from "../../middlewares/protect";
import roleCheck from "../../middlewares/roleCheck";
const router = Router();
import ApplicationController from "../../controllers/Tutor/applicationController";

// ✅ Tất cả routes đều protected (yêu cầu đăng nhập)

// 📋 GET /api/applications - Lấy danh sách đơn ứng tuyển (có lọc status)
// Query: ?status=applied|approved|withdrawn|rejected
router.get(
  "/",
  protect,
  roleCheck("tutor"),
  ApplicationController.getTutorApplications
);

// 📄 GET /api/applications/:applicationId - Lấy chi tiết 1 đơn
router.get(
  "/:applicationId",
  protect,
  roleCheck("tutor"),
  ApplicationController.getApplicationById
);

// 🚫 POST /api/applications/:applicationId/withdraw - Rút đơn
router.post(
  "/:applicationId/withdraw",
  protect,
  roleCheck("tutor"),
  ApplicationController.withdrawApplication
);

// POST /api/applications/:applicationId/confirm - Gia sư xác nhận or từ chối lớp học
router.post(
  "/:applicationId/confirm",
  protect,
  roleCheck("tutor"),
  ApplicationController.confirmClass
);
export default router;

/**
 * File: backend/src/controllers/searchController.js
 */

import { Request, Response } from "express";
import SearchModel from "../../models/Tutor/SearchModel";
import ApplicationModel from "../../models/Tutor/ApplicationModel";
import ClassModel from "../../models/Tutor/ClassModel";
import { responseFormatter } from "../../utils/responseFormatter";
import type { SearchResult } from "../../models/Tutor/SearchModel";
import type { ClassDetail } from "../../models/Tutor/ClassModel";
import redisConfig from "../../config/redis";
import { log } from "node:console";
const redisClient = redisConfig.client;

// --- Interfaces ---

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface SearchQuery {
  min_hourly_price?: string;
  max_hourly_price?: string;
  subject_id?: string;
  classLevel?: string;
  province_id?: string;
}

interface ApplyClassBody {
  // Không có body, class_id từ params
}
/**
 * Tìm kiếm lớp học
 * GET /api/search/classes
 */

const searchClasses = async (
  req: Request<never, never, never, SearchQuery>,
  res: Response
): Promise<void> => {
  console.log("📡 [searchClasses] Handler called!");
  try {
    const {
      min_hourly_price,
      max_hourly_price,
      subject_id,
      classLevel,
      province_id,
    } = req.query;
    const tutorUserId = (req as unknown as AuthRequest).user?.user_id;
    console.log("Tutor User ID:", tutorUserId);
    console.log("[searchClasses] request: ", req.query);
    // 1. Tạo cache key chuẩn
    const filterObj: any = {
      min_hourly_price,
      max_hourly_price,
      subject_id,
      classLevel,
      province_id,
    };

    // 3. Nếu không có trong cache thì query database
    console.log("🐢 [searchClasses] Fetching from DB...");
    const filters = {
      ...filterObj,
      tutorUserId: tutorUserId || null,
      classId: null,
    };
    const results = await SearchModel.searchClasses(filters);
    console.log(`✅ [searchClasses] Found ${results.length} classes`);
    console.log("📊 Dữ liệu lấy từ database:", results);
    res
      .status(200)
      .json(responseFormatter(results, "Tìm kiếm lớp học thành công"));
  } catch (error: any) {
    console.error("❌ [searchClasses] Error:", error.message);
    res
      .status(500)
      .json(
        responseFormatter(false, error.message || "Lỗi khi tìm kiếm lớp học")
      );
  }
};

/**
 * Lấy chi tiết lớp
 * GET /api/search/classes/:classId
 */
const getClassDetail = async (
  req: Request<{ classId: string }>,
  res: Response
): Promise<void> => {
  try {
    console.log("📚 [getClassDetail] Called");
    const { classId } = req.params;
    console.log(`📚 [getClassDetail] Class: ${classId}`);
    if (!classId) {
      res
        .status(400)
        .json(responseFormatter(false, "Vui lòng cung cấp class_id"));
      return;
    }
    const result = await ClassModel.getClassDetail(classId, null as any);
    console.log(`✅ [getClassDetail] Found class detail`);
    console.log("Dữ liệu lấy từ database: ", result);
    // 🔒 Privacy Check: Always hide student info in Search/Public view
    const modifiedResult = { ...result } as any;

    if (modifiedResult) {
      delete modifiedResult.student_name;
      delete modifiedResult.student_phone;
      delete modifiedResult.student_email;
      delete modifiedResult.student_location;
      delete modifiedResult.student_dob;
    }

    res
      .status(200)
      .json(
        responseFormatter(modifiedResult, "Lấy chi tiết lớp học thành công")
      );
  } catch (error: any) {
    console.error("❌ [getClassDetail] Error:", error.message);
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
 * Ứng tuyển lớp
 * POST /api/search/classes/:classId/apply
 * Protected: Tutor only
 */

const applyClass = async (
  req: Request<{ classId: string }, never, ApplyClassBody>,
  res: Response
): Promise<void> => {
  try {
    console.log("📝 [applyClass] Called");
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
      `📝 [applyClass] Tutor ${tutorUserId} applying for class ${classId}`
    );

    const application = await ApplicationModel.createApplication(
      tutorUserId,
      classId
    );
    console.log(`✅ [applyClass] Applied successfully`);
    console.log("dữ liệu application lấy từ database", application);

    res
      .status(201)
      .json(responseFormatter(application, "Ứng tuyển lớp thành công"));
  } catch (error: any) {
    console.error("❌ [applyClass] Error:", error.message);
    res
      .status(400)
      .json(responseFormatter(false, error.message || "Lỗi khi ứng tuyển lớp"));
  }
};
export default {
  searchClasses,
  getClassDetail,
  applyClass,
};

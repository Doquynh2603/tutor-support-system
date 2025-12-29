/**
 * File: TutorController.js
 * Mục đích: Controller xử lý các request liên quan đến tutor
 * Vai trò: Business logic cho CRUD operations tutor profile
 */

import { Request, Response } from "express";
import tutorModel from "../../models/Tutor/tutorModel";
import { responseFormatter } from "../../utils/responseFormatter";
import type {
  TutorProfile,
  UpdateTutorProfileData,
} from "../../models/Tutor/tutorModel";

/**
 * Helper: Format response
 */

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface UpdateProfileBody {
  name?: string;
  dateOfBirth?: string;
  phone?: string;
  locationDetail?: string;
  address_id?: string;
  introduction?: string;
  experience_years?: number | string;
  subjects?: string[]; // Array of subject_id
}
/**
 * @desc Lấy thông tin profile gia sư
 * @route GET /api/tutor/profile
 * @return {Object} Tutor profile
 */
const getTutorProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Lấy user ID từ middleware protect
    console.log("📥 [getTutorProfile] Called");

    const userId = req.user?.user_id;

    if (!userId) {
      res
        .status(400)
        .json(responseFormatter(false, "User ID không được cung cấp"));
      return;
    }

    console.log(`📥 [getTutorProfile] Request for user: ${userId}`);

    // ✅ Model đã format subjects thành array objects {subject_id, name}
    const tutorProfile = await tutorModel.getTutorProfile(userId);

    if (!tutorProfile) {
      res
        .status(404)
        .json(responseFormatter(false, "Thông tin gia sư không tồn tại"));
      return;
    }

    console.log("✅ [getTutorProfile] Profile fetched successfully");
    console.log("   - Subjects:", tutorProfile.subjects);

    res.status(200).json({
      success: true,
      message: "Lấy thông tin profile thành công",
      data: tutorProfile,
    });
  } catch (error: any) {
    console.error("❌ [getTutorProfile] Error:", error.message);
    res
      .status(500)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi server khi lấy thông tin profile"
        )
      );
  }
};

/**
 * @desc Cập nhật thông tin profile gia sư
 * @route PUT /api/tutor/profile
 * @body {
 *   name?: string,
 *   dateOfBirth?: date,
 *   phone?: string,
 *   locationDetail?: string,
 *   address_id?: uuid,
 *   introduction?: string,
 *   experience_years?: number,
 *   subjects?: string[] (array of subject_id)
 * }
 * @return {Object} Updated tutor profile
 */
const updateTutorProfile = async (
  req: Request<never, never, UpdateProfileBody>,
  res: Response
): Promise<void> => {
  try {
    // Lấy user ID từ middleware protect
    const userId = (req as AuthRequest).user?.user_id;

    if (!userId) {
      res
        .status(400)
        .json(responseFormatter(false, "User ID không được cung cấp"));
      return;
    }

    console.log(`📝 [updateTutorProfile] Updating for user ID: ${userId}`);

    const {
      name,
      dateOfBirth,
      phone,
      locationDetail,
      address_id,
      introduction,
      experience_years,
      subjects, // ✅ Nhận array subject_id
    } = req.body;

    console.log("📨 Request body:", req.body);

    // ✅ Validate phone format
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      res
        .status(400)
        .json(responseFormatter(false, "Số điện thoại phải có 10-11 chữ số"));
      return;
    }

    // ✅ Validate name length
    if (name && (name.length < 2 || name.length > 255)) {
      res
        .status(400)
        .json(responseFormatter(false, "Họ tên phải từ 2-255 ký tự"));
      return;
    }

    // ✅ Validate introduction length
    if (introduction && introduction.length > 1000) {
      res
        .status(400)
        .json(
          responseFormatter(false, "Giới thiệu không được vượt quá 1000 ký tự")
        );
      return;
    }

    // ✅ Validate experience_years
    if (
      experience_years !== undefined &&
      experience_years !== null &&
      (parseInt(String(experience_years)) < 0 ||
        parseInt(String(experience_years)) > 60)
    ) {
      res
        .status(400)
        .json(responseFormatter(false, "Số năm kinh nghiệm phải từ 0-60"));
      return;
    }

    // ✅ Convert subjects array to JSON string
    let subjectsJson: string | null = null;
    if (subjects !== undefined && subjects !== null) {
      if (!Array.isArray(subjects)) {
        res
          .status(400)
          .json(responseFormatter(false, "subjects phải là array"));
        return;
      }

      if (subjects.length > 0) {
        // ✅ Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const invalidSubjects = subjects.filter(
          (id) => !uuidRegex.test(String(id))
        );

        if (invalidSubjects.length > 0) {
          console.warn("⚠️ Invalid subject IDs:", invalidSubjects);
          res
            .status(400)
            .json(
              responseFormatter(
                false,
                `Subject IDs không hợp lệ: ${invalidSubjects.join(", ")}`
              )
            );
          return;
        }

        // ✅ Convert array to JSON string
        subjectsJson = JSON.stringify(subjects);
        console.log("✅ Subjects converted to JSON:", subjectsJson);
      } else {
        // ✅ Empty array
        subjectsJson = JSON.stringify([]);
        console.log("✅ Empty subjects array");
      }
    }

    // ✅ Build profile data
    const profileData: UpdateTutorProfileData = {
      name: name || undefined,
      dateOfBirth: dateOfBirth || undefined,
      phone: phone || undefined,
      locationDetail: locationDetail || undefined,
      address_id: address_id || undefined,
      introduction: introduction || undefined,
      experience_years:
        experience_years !== undefined
          ? parseInt(experience_years as string)
          : undefined,
      subjects_json: subjectsJson || undefined, // ✅ Pass JSON string
    };

    console.log(
      "📤 Calling tutorModel.updateTutorProfile with data:",
      profileData
    );

    // ✅ Model sẽ format subjects thành array objects {subject_id, name}
    const updatedProfile = await tutorModel.updateTutorProfile(
      userId,
      profileData
    );

    console.log("✅ [updateTutorProfile] Profile updated successfully");
    console.log("   - Updated subjects:", updatedProfile.subjects);

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin profile thành công",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("❌ [updateTutorProfile] Error:", error.message);
    console.error("   Stack:", error.stack);

    res
      .status(400)
      .json(
        responseFormatter(
          false,
          error.message || "Lỗi khi cập nhật thông tin profile"
        )
      );
  }
};

export default {
  getTutorProfile,
  updateTutorProfile,
};

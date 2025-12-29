/**
 * File: studentModel.js
 * Mục đích: Model xử lý database operations cho Student profile
 * Vai trò: Các hàm query lấy và cập nhật thông tin học sinh
 */

import { QueryTypes } from "sequelize";
import { sequelize } from "../../config/sqlserver";

/**
 * Lấy thông tin profile học sinh
 * @param {number} userId - User ID
 * @returns {Promise} Student profile data
 */
// Interface cho dữ liệu Profile trả về

export interface StudentProfile {
  student_id: string; // student_profile_id
  user_id: string;
  email: string;
  name: string;
  phone: string | null;
  dateOfBirth: string | null; // SQL Date -> string YYYY-MM-DD
  age: number | null; // Calculated field in View
  locationDetail: string | null;
  gradeLevel: number | null;
  school: string | null;
  gender: boolean | null;
  status: boolean;
  is_verified: boolean;
  role: string;
  created_at: Date;
  updated_at: Date;
  // Location info
  ward_name?: string;
  district_name?: string;
  province_name?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  locationDetail?: string;
  dateOfBirth?: string;
  address_id?: string;
  gradeLevel?: number;
  school?: string;
}
export const getStudentProfile = async (
  userId: string
): Promise<StudentProfile> => {
  try {
    const query = `
        SELECT * FROM student_info
        WHERE user_id = :userId
        `;
    const student = await sequelize.query<StudentProfile>(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });
    if (!student || student.length === 0) {
      throw new Error("Không tìm thấy thông tin học sinh");
    }
    console.log(
      "✅ [studentModel] getStudentProfile: Tìm thấy thông tin học sinh",
      student
    );
    return student[0];
  } catch (error: any) {
    console.error("❌ [studentModel] getStudentProfile error:", error.message);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile học sinh
 * @param {number} userId - User ID
 * @param {object} profileData - Dữ liệu cần cập nhật
 * @returns {Promise} Updated student profile
 */

export const updateStudentProfile = async (
  userId: string,
  profileData: UpdateProfileData
): Promise<StudentProfile> => {
  try {
    const {
      fullName,
      phone,
      locationDetail,
      dateOfBirth,
      address_id,
      gradeLevel,
      school,
    } = profileData;

    console.log(
      `📝 [studentModel] updateStudentProfile: Cập nhật cho user ID: ${userId}`
    );
    console.log("   - Dữ liệu:", profileData);

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      throw new Error("Số điện thoại phải có 10-11 chữ số");
    }

    if (fullName && (fullName.length < 2 || fullName.length > 255)) {
      throw new Error("Họ tên phải từ 2-255 ký tự");
    }
    const query = `
      EXEC sp_UpdateStudentInfo
        @StudentUserId = :userId,
        @name = :fullName,
        @dateOfBirth = :dateOfBirth,
        @phone = :phone,
        @address_id = :address_id,
        @locationDetail = :locationDetail,
        @gradeLevel = :gradeLevel,
        @school = :school`;
    await sequelize.query(query, {
      replacements: {
        userId,
        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
        phone: phone || null,
        address_id: address_id || null,
        locationDetail: locationDetail || null,
        gradeLevel: gradeLevel || null,
        school: school || null,
      },
    });
    console.log("✅ [studentModel] Cập nhật thành công");
    return await getStudentProfile(userId);
  } catch (error: any) {
    console.error(
      "❌ [studentModel] updateStudentProfile error:",
      error.message
    );
    throw error;
  }
};

export default {
  getStudentProfile,
  updateStudentProfile,
};

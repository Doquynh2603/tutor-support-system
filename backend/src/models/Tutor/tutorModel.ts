/**
 * Mục đích: Service layer cho Tutor profile management
 * Vai trò:
 *   - Xử lý business logic cho CRUD operations của tutor profile
 *   - Tương tác với SQL Server database thông qua stored procedures
 */

import { sequelize } from "../../config/sqlserver";
import { QueryTypes } from "sequelize";

// --- Interfaces (Based on tutor_info View) ---

export interface SubjectInfo {
  subject_id: string; // UNIQUEIDENTIFIER
  name: string;
}

// ✅ Khớp với View [dbo].[tutor_info]
export interface TutorProfile {
  tutor_id: string; // tutor_profile_id (UNIQUEIDENTIFIER)
  bio: string | null; // introduction
  experience_years: number | null;
  subjects: string | null; // JSON string: ["id1", "id2", ...]
  hourly_rate: number | null; // DECIMAL(10,2)
  avg_rating: number | null; // DECIMAL(3,2)
  total_reviews: number | null; // INT
  user_id: string; // UNIQUEIDENTIFIER
  email: string;
  name: string;
  phone: string | null; // VARCHAR(20)
  dateOfBirth: string | null; // DATE -> string YYYY-MM-DD
  age: number | null; // Calculated field (DATEDIFF)
  role: string; // 'tutor'
  gender: boolean | null; // BIT
  locationDetail: string | null; // NVARCHAR(255)
  created_at: Date;
  updated_at: Date;
  status: boolean; // BIT
  is_verified: boolean; // BIT
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  // ✅ Parsed fields (thêm sau khi format)
  subjects_list?: SubjectInfo[];
  subject_ids?: string[];
}

export interface UpdateTutorProfileData {
  name?: string;
  dateOfBirth?: string;
  phone?: string;
  locationDetail?: string;
  address_id?: string;
  introduction?: string;
  experience_years?: number;
  subjects_json?: string;
}

/**
 * ✅ THÊM: Lấy tên môn học từ subject_id
 */
export const getSubjectNames = async (
  subjectIds: string[]
): Promise<SubjectInfo[]> => {
  try {
    if (!subjectIds || subjectIds.length === 0) {
      return [];
    }

    console.log(
      `📚 [getSubjectNames] Fetching names for ${subjectIds.length} subjects`
    );

    // Tạo placeholders cho IN clause
    const placeholders = subjectIds.map((_, index) => `:id${index}`).join(",");
    const replacements: any = {};
    subjectIds.forEach((id, index) => {
      replacements[`id${index}`] = id;
    });

    const query = `
      SELECT subject_id, name
      FROM Subjects
      WHERE subject_id IN (${placeholders})
    `;

    const results = await sequelize.query<SubjectInfo>(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
    [];
    console.log(
      `✅ [getSubjectNames] Found ${results.length} subjects:`,
      results
    );
    return results;
  } catch (error: any) {
    console.error("❌ [getSubjectNames] Error:", error.message);
    return [];
  }
};

/**
 * ✅ SỬA: Format tutor profile - chuyển subject_id thành subject names
 */
export const formatTutorProfile = async (
  profile: any
): Promise<TutorProfile | null> => {
  if (!profile) return null;

  try {
    // Parse subjects JSON nếu là string
    let subjectIds: string[] = [];
    if (profile.subjects) {
      try {
        subjectIds =
          typeof profile.subjects === "string"
            ? JSON.parse(profile.subjects)
            : Array.isArray(profile.subjects)
            ? profile.subjects
            : [];
      } catch (e: any) {
        console.warn("⚠️ Lỗi parse subjects JSON:", e);
        subjectIds = [];
      }
    }

    console.log(`📝 [formatTutorProfile] Subject IDs:`, subjectIds);

    // Lấy tên môn học
    let subjectNames: SubjectInfo[] = [];
    if (subjectIds.length > 0) {
      subjectNames = await getSubjectNames(subjectIds);
    }

    console.log(`📝 [formatTutorProfile] Subject Names:`, subjectNames);

    // ✅ Return profile với subjects là array of objects {subject_id, name}
    return {
      ...profile,
      subjects: subjectNames, // ✅ Chuyển từ JSON string -> array objects
      subject_ids: subjectIds, // ✅ Keep original IDs nếu cần
    };
  } catch (error: any) {
    console.error("❌ [formatTutorProfile] Error:", error.message);
    // Trả về profile gốc nếu có lỗi
    return profile;
  }
};

/**
 * ✅ SỬA: Lấy thông tin profile của gia sư
 * Mục đích: Fetch tutor profile từ database (sử dụng view tutor_info - có đầy đủ info địa điểm)
 * Format subjects thành tên môn học trước khi return
 */
const getTutorProfile = async (userId: string): Promise<TutorProfile> => {
  try {
    console.log(`🔍 [getTutorProfile] Fetching for user ID: ${userId}`);

    // ✅ SỬA: Query từ view tutor_info
    const query = `
      SELECT 
        *
      FROM tutor_info 
      WHERE user_id = :userId
    `;

    console.log("📤 Executing query:", query);
    console.log("   Replacements:", { userId });

    const results = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    console.log("📨 Raw query results:", results);

    // ✅ SỬA: Check results trước khi access
    if (!results || results.length === 0) {
      console.warn("⚠️ [getTutorProfile] No profile found for user:", userId);
      throw new Error("Không tìm thấy thông tin gia sư");
    }

    let result = results[0];
    console.log(`✅ [getTutorProfile] Found tutor profile (raw):`, result);

    // ✅ Format subjects từ ID -> names
    const formattedProfile = await formatTutorProfile(result);
    if (!formattedProfile) {
      throw new Error("Lỗi khi định dạng thông tin gia sư");
    }
    return formattedProfile;
  } catch (error) {
    console.error(
      "❌ [getTutorProfile] Error:",
      error.message || error.toString()
    );
    throw new Error(error.message || "Lỗi khi lấy thông tin gia sư");
  }
};

/**
 * ✅ SỬA: Cập nhật thông tin profile gia sư
 * Sử dụng stored procedure sp_UpdateTutorInfo
 * Format subjects khi return
 */
const updateTutorProfile = async (
  userId: string,
  profileData: UpdateTutorProfileData
): Promise<TutorProfile> => {
  try {
    const {
      name,
      dateOfBirth,
      phone,
      locationDetail,
      address_id,
      introduction,
      experience_years,
      subjects_json,
    } = profileData;

    console.log(`📝 [updateTutorProfile] Updating for user ID: ${userId}`);
    console.log("   Data:", profileData);

    // ✅ Validate dữ liệu trước khi gọi stored procedure
    if (
      experience_years !== undefined &&
      experience_years !== null &&
      (experience_years < 0 || experience_years > 60)
    ) {
      throw new Error("Số năm kinh nghiệm phải từ 0-60");
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      throw new Error("Số điện thoại phải có 10-11 chữ số");
    }

    if (name && (name.length < 2 || name.length > 255)) {
      throw new Error("Họ tên phải từ 2-255 ký tự");
    }

    if (introduction && introduction.length > 1000) {
      throw new Error("Giới thiệu không được vượt quá 1000 ký tự");
    }

    // ✅ Gọi stored procedure để cập nhật
    const query = `
      EXEC sp_UpdateTutorInfo
        @TutorUserId = :userId,
        @name = :name,
        @dateOfBirth = :dateOfBirth,
        @phone = :phone,
        @locationDetail = :locationDetail,
        @address_id = :address_id,
        @introduction = :introduction,
        @experience_years = :experience_years,
        @subjects = :subjects_json
    `;

    console.log("📤 Executing stored procedure sp_UpdateTutorInfo...");

    await sequelize.query(query, {
      replacements: {
        userId,
        name: name || null,
        dateOfBirth: dateOfBirth || null,
        phone: phone || null,
        locationDetail: locationDetail || null,
        address_id: address_id || null,
        introduction: introduction || null,
        experience_years: experience_years || null,
        subjects_json: subjects_json || "[]", // ✅ Default empty array
      },
    });

    console.log("✅ [updateTutorProfile] Profile updated in database");

    // ✅ Lấy lại thông tin profile sau khi cập nhật (và format subjects)
    const updatedProfile = await getTutorProfile(userId);
    return updatedProfile;
  } catch (error: any) {
    console.error(
      "❌ [updateTutorProfile] Error:",
      error.message || error.toString()
    );
    throw new Error(error.message || "Lỗi khi cập nhật thông tin gia sư");
  }
};

const tutorModel = {
  getTutorProfile,
  updateTutorProfile,
};

export default tutorModel;

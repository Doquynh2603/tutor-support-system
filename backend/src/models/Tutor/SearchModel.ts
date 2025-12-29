import { sequelize } from "../../config/sqlserver";
import { QueryTypes } from "sequelize";

// ✅ Khớp với View_ClassList
export interface SearchResult {
  class_id: string;
  tutor_id: string | null;
  student_id: string;
  hourly_price: number;
  classLevel: number;
  class_status: string;
  created_at: Date;
  subject_id: string;
  subject_name: string;
  classLocation: string | null;
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
  application_status?: string | null; // Thêm khi có LEFT JOIN TutorApplication
}

export interface SearchFilters {
  min_hourly_price?: number;
  max_hourly_price?: number;
  subject_id?: string;
  classLevel?: number;
  province_id?: string;
  tutorUserId?: string;
  classId?: string;
}
/**
 * File: backend/src/models/SearchModel.js
 * Mục đích: Model cho search classes và apply class
 */
class SearchModel {
  static async searchClasses(
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        min_hourly_price,
        max_hourly_price,
        subject_id,
        classLevel,
        province_id,
        tutorUserId,
        classId,
      } = filters;

      console.log("📡 [SearchModel] Searching with filters:", filters);
      const query = `EXEC sp_SearchClasses
        @min_hourly_price = :min_hourly_price,
        @max_hourly_price = :max_hourly_price,
        @subject_id = :subject_id,
        @classLevel = :classLevel,
        @province_id = :province_id,
        @tutorUserId = :tutorUserId,
        @classId = :classId
      `;
      console.log("🔍 [SearchModel] Executing query:", query);

      const results = await sequelize.query<SearchResult>(query, {
        replacements: {
          min_hourly_price: min_hourly_price
            ? parseInt(min_hourly_price.toString())
            : null,
          max_hourly_price: max_hourly_price
            ? parseInt(max_hourly_price.toString())
            : null,
          subject_id: subject_id ? subject_id : null,
          classLevel: classLevel ? parseInt(classLevel.toString()) : null,
          province_id: province_id || null,
          tutorUserId: tutorUserId || null,
          classId: classId || null,
        },
        type: QueryTypes.SELECT,
      });

      console.log(
        `✅ [SearchModel.searchClasses] Found ${results.length} total rows`
      );

      console.log("Dữ liệu lấy được từ database: ", results);
      return results;
    } catch (error: any) {
      console.error("❌ [SearchModel.searchClasses] Error:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }
}

export default SearchModel;

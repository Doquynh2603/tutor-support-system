import { sequelize } from "../../config/sqlserver";
import { QueryTypes } from "sequelize";

// ✅ Interface khớp với View [dbo].[View_FavoritesTutor]
export interface FavoriteTutor {
  favoriteId: string; // Alias trong View
  created_at: Date;
  student_id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string | null;
  locationDetail: string | null;
  bio: string | null;
  experience_years: number | null;
  hourly_rate: number | null;
  avg_rating: number | null;
  total_reviews: number | null;
  subjects: string | null; // JSON string trong DB
  ward_name: string | null;
  district_name: string | null;
  province_name: string | null;
}

class FavoritesModel {
  static async getFavoriteByStudentId(
    studentId: string
  ): Promise<FavoriteTutor[]> {
    const query = `
            select * from View_FavoritesTutor
            where student_id = :studentId
            order by created_at desc 
        `;
    const result = await sequelize.query<FavoriteTutor>(query, {
      replacements: { studentId },
      type: QueryTypes.SELECT,
    });
    return result;
  }
  static async manageFavorite(
    studentId: string,
    tutorId: string,
    action: string
  ): Promise<any> {
    const query = `
        EXEC sp_ManageFavorite
        @userId = :studentId,
        @tutorId = :tutorId,
        @action = :action
        `;
    const result = await sequelize.query(query, {
      replacements: { studentId, tutorId, action },
      type: QueryTypes.RAW,
    });
    return result;
  }
}
export default FavoritesModel;

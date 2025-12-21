const { sequelize } = require("../../config/sqlserver");
const { QueryTypes } = require("sequelize");

class FavoritesModel {
  static async getFavoriteByStudentId(studentId) {
    const query = `
            select * from View_FavoritesTutor
            where student_id = :studentId
            order by created_at desc 
        `;
    const result = await sequelize.query(query, {
      replacements: { studentId },
      type: QueryTypes.SELECT,
    });
    return result;
  }
  static async manageFavorite(studentId, tutorId, action) {
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
module.exports = FavoritesModel;

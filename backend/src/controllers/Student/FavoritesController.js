const FavoritesModel = require("../../models/Student/favoritesModel");
const { responseFormatter } = require("../../utils/responseFormatter");
class FavoritesController {
  static async getFavorites(req, res) {
    try {
      const student_user_id = req.user.user_id;
      const favoritesTutor = await FavoritesModel.getFavoriteByStudentId(
        student_user_id
      );
      console.log(
        "danh sách gia sư yêu thích được lấy từ database: ",
        favoritesTutor
      );
      return res
        .status(200)
        .json(
          responseFormatter(
            favoritesTutor,
            "Lấy danh sách yêu thích thành công"
          )
        );
    } catch (error) {
      console.error("Error getting favorites:", error);
      res
        .status(500)
        .json(
          responseFormatter(
            false,
            error.message || "Lỗi khi lấy danh sách yêu thích"
          )
        );
    }
  }

  static async addFavorite(req, res) {
    try {
      const student_user_id = req.user.user_id;
      const { tutor_id } = req.body;
      if (!tutor_id) {
        return res
          .status(400)
          .json(responseFormatter(false, "tutor_id là bắt buộc"));
      }
      const result = await FavoritesModel.manageFavorite(
        student_user_id,
        tutor_id,
        "add"
      );
      console.log("Kết quả thêm gia sư yêu thích: ", result);
      return res
        .status(200)
        .json(responseFormatter(result, "Thêm gia sư yêu thích thành công"));
    } catch (error) {
      console.error("Error adding favorite:", error);
      return res
        .status(500)
        .json(
          responseFormatter(false, error.message || "Lỗi khi thêm yêu thích")
        );
    }
  }
  static async removeFavorite(req, res) {
    try {
      const student_user_id = req.user.user_id;
      const { tutor_id } = req.body;
      if (!tutor_id) {
        return res
          .status(400)
          .json(responseFormatter(false, "tutor_id là bắt buộc"));
      }
      const result = await FavoritesModel.manageFavorite(
        student_user_id,
        tutor_id,
        "remove"
      );
      console.log("Kết quả xóa gia sư yêu thích: ", result);
      return res
        .status(200)
        .json(responseFormatter(result, "Xóa gia sư yêu thích thành công"));
    } catch (error) {
      console.error("Error removing favorite:", error);
      return res
        .status(500)
        .json(
          responseFormatter(false, error.message || "Lỗi khi xóa yêu thích")
        );
    }
  }
}
module.exports = FavoritesController;

import { Request, Response } from "express";
import FavoritesModel from "../../models/Student/favoritesModel";
import { responseFormatter } from "../../utils/responseFormatter";

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  };
}
interface AddRemoveFavoriteBody {
  tutor_id: string;
}
class FavoritesController {
  static async getFavorites(req: AuthRequest, res: Response): Promise<void> {
    try {
      const student_user_id = req.user?.user_id;
      console.log(
        `📋 [getFavorites] Getting favorites for student ${student_user_id}`
      );
      if (!student_user_id) {
        res
          .status(401)
          .json(responseFormatter(false, "Không được phép truy cập"));
        return;
      }
      const favoritesTutor = await FavoritesModel.getFavoriteByStudentId(
        student_user_id
      );
      console.log(
        "danh sách gia sư yêu thích được lấy từ database: ",
        favoritesTutor
      );
      res
        .status(200)
        .json(
          responseFormatter(
            favoritesTutor,
            "Lấy danh sách yêu thích thành công"
          )
        );
    } catch (error: any) {
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

  static async addFavorite(
    req: Request<never, never, AddRemoveFavoriteBody>,
    res: Response
  ): Promise<void> {
    try {
      const student_user_id = (req as AuthRequest).user?.user_id;
      const { tutor_id } = req.body;
      console.log(
        `📝 [addFavorite] Adding tutor ${tutor_id} to favorites for student ${student_user_id}`
      );
      if (!student_user_id) {
        res
          .status(401)
          .json(responseFormatter(false, "Không được phép truy cập"));
        return;
      }

      if (!tutor_id) {
        res.status(400).json(responseFormatter(false, "tutor_id là bắt buộc"));
        return;
      }
      const result = await FavoritesModel.manageFavorite(
        student_user_id,
        tutor_id,
        "add"
      );
      console.log("Kết quả thêm gia sư yêu thích: ", result);
      res
        .status(200)
        .json(responseFormatter(result, "Thêm gia sư yêu thích thành công"));
    } catch (error) {
      console.error("❌ [addFavorite] Error:", error.message);
      res
        .status(500)
        .json(
          responseFormatter(false, error.message || "Lỗi khi thêm yêu thích")
        );
    }
  }
  static async removeFavorite(
    req: Request<never, never, AddRemoveFavoriteBody>,
    res: Response
  ): Promise<void> {
    try {
      const student_user_id = (req as AuthRequest).user?.user_id;
      const { tutor_id } = req.body;
      console.log(
        `🗑️ [removeFavorite] Removing tutor ${tutor_id} from favorites for student ${student_user_id}`
      );

      if (!student_user_id) {
        res
          .status(401)
          .json(responseFormatter(false, "Không được phép truy cập"));
        return;
      }

      if (!tutor_id) {
        res.status(400).json(responseFormatter(false, "tutor_id là bắt buộc"));
        return;
      }
      const result = await FavoritesModel.manageFavorite(
        student_user_id,
        tutor_id,
        "remove"
      );
      console.log("Kết quả xóa gia sư yêu thích: ", result);
      res
        .status(200)
        .json(responseFormatter(result, "Xóa gia sư yêu thích thành công"));
    } catch (error: any) {
      console.error("❌ [removeFavorite] Error:", error.message);
      res
        .status(500)
        .json(
          responseFormatter(false, error.message || "Lỗi khi xóa yêu thích")
        );
    }
  }
}
export default FavoritesController;

/**
 * File: routes/locationRoutes.js
 * Mục đích: Routes cho quản lý thông tin địa lý
 * Vai trò:
 *   - GET /provinces - Lấy danh sách tỉnh/thành phố
 *   - GET /provinces/:id/wards - Lấy danh sách phường/xã theo tỉnh
 */

import { Router } from "express";
import locationController from "../controllers/locationController";
const router = Router();
// Route để lấy danh sách tỉnh/thành phố
router.get("/provinces", locationController.getProvinces);
// Route để lấy danh sách quận/huyện theo tỉnh
router.get("/districts/:provinceId", locationController.getDistricts);

// Route để lấy danh sách phường/xã theo quận/huyện
router.get("/wards/:districtId", locationController.getWards);

export default router;

/**
 * File: routes/locationRoutes.js
 * Mục đích: Routes cho quản lý thông tin địa lý
 * Vai trò:
 *   - GET /provinces - Lấy danh sách tỉnh/thành phố
 *   - GET /provinces/:id/wards - Lấy danh sách phường/xã theo tỉnh
 */

const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Route để lấy danh sách tỉnh/thành phố
router.get("/provinces", locationController.getProvinces);

// Route để lấy danh sách phường/xã theo tỉnh
router.get(
  "/provinces/:provinceId/wards",
  locationController.getWardsByProvince
);

// Route để lấy tất cả phường/xã (với province_name)
router.get("/wards", locationController.getAllWards);

module.exports = router;

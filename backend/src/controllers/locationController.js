/**
 * File: controllers/locationController.js
 * Mục đích: Controller cho quản lý thông tin địa lý
 * Vai trò: Gọi locationModel để xử lý business logic
 */

const locationModel = require("../models/locationModel");

/**
 * Lấy danh sách tỉnh/thành phố
 */
exports.getProvinces = async (req, res) => {
  try {
    console.log("📍 [getProvinces] Request received");

    const provinces = await locationModel.getProvinces();

    res.status(200).json({
      success: true,
      data: provinces,
      message: "Lấy danh sách tỉnh/thành phố thành công",
    });
  } catch (error) {
    console.error("❌ [getProvinces] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách tỉnh/thành phố",
    });
  }
};

/**
 * Lấy danh sách phường/xã theo tỉnh
 */
exports.getWardsByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;
    console.log(`📍 [getWardsByProvince] Request for province: ${provinceId}`);

    if (!provinceId) {
      return res.status(400).json({
        success: false,
        message: "provinceId là bắt buộc",
      });
    }

    const wards = await locationModel.getWardsByProvince(provinceId);

    res.status(200).json({
      success: true,
      data: wards,
      message: "Lấy danh sách huyện/quận thành công",
    });
  } catch (error) {
    console.error("❌ [getWardsByProvince] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách huyện/quận",
    });
  }
};

/**
 * Lấy danh sách tất cả phường/xã (với province_name)
 */
exports.getAllWards = async (req, res) => {
  try {
    console.log("📍 [getAllWards] Fetching all wards...");

    const wards = await locationModel.getAllWards();

    res.status(200).json({
      success: true,
      data: wards,
      message: "Lấy danh sách tất cả huyện/quận thành công",
    });
  } catch (error) {
    console.error("❌ [getAllWards] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách phường/xã",
    });
  }
};

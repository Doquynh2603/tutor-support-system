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
 * Lấy danh sách quận/huyện theo tỉnh
 */

exports.getDistricts = async (req, res) => {
  const { provinceId } = req.params;
  try {
    console.log(`📍 [getDistricts] Request for province: ${provinceId}`);
    const districts = await locationModel.getDistricts(provinceId);
    res.status(200).json({
      success: true,
      data: districts,
      message: `Lấy danh sách quận huyện của tỉnh có id ${provinceId} thành công`,
    });
  } catch (error) {
    console.error("❌ [getDistricts] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách quận/huyện",
    });
  }
};
/**
 * Lấy danh sách phường/xã theo quận/huyện
 */
exports.getWards = async (req, res) => {
  try {
    const { districtId } = req.params;
    console.log(`📍 [getWards] Request for district: ${districtId}`);

    const wards = await locationModel.getWards(districtId);

    res.status(200).json({
      success: true,
      data: wards,
      message: "Lấy danh sách phường/xã thành công",
    });
  } catch (error) {
    console.error("❌ [getWards] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách phường/xã",
    });
  }
};

/**
 * Lấy tất cả phường/xã
 */
exports.getAllWards = async (req, res) => {
  try {
    console.log("📍 [getAllWards] Request received");

    const wards = await locationModel.getAllWards();

    res.status(200).json({
      success: true,
      data: wards,
      message: "Lấy tất cả phường/xã thành công",
    });
  } catch (error) {
    console.error("❌ [getAllWards] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy tất cả phường/xã",
    });
  }
};

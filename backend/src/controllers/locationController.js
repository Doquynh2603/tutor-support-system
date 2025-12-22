/**
 * File: controllers/locationController.js
 * Mục đích: Controller cho quản lý thông tin địa lý
 * Vai trò: Gọi locationModel để xử lý business logic
 */

const locationModel = require("../models/locationModel");
const redisClient = require("../config/redis");
/**
 * Lấy danh sách tỉnh/thành phố
 */
const cacheResponse = async (key, data, ttl = 86400) => {
  await redisClient.set(key, JSON.stringify(data), {
    EX: ttl, // Mặc định TTL là 24 giờ
  });
};
exports.getProvinces = async (req, res) => {
  try {
    console.log("📍 [getProvinces] Request received");
    // 1. check redis cache
    const cacheKey = "location:provinces";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getProvinces] Returning from Redis Cache");
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        message: "Lấy danh sách tỉnh/thành phố thành công (từ cache)",
      });
    }

    // 2. nếu không có trong cache thì query database
    console.log("🐢 [getProvinces] Fetching from DB...");
    const provinces = await locationModel.getProvinces();
    // 3. lưu kết quả vào redis cache với TTL 24 giờ
    await cacheResponse(cacheKey, provinces);
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
    // 1. check redis cache
    const cacheKey = `location:districts:${provinceId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getDistricts] Returning from Redis Cache");
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        message: `Lấy danh sách quận huyện của tỉnh có id ${provinceId} thành công`,
      });
    }
    // 2. nếu không có trong cache thì query database
    console.log("🐢 [getDistricts] Fetching from DB...");
    const districts = await locationModel.getDistricts(provinceId);
    // 3. lưu kết quả vào redis cache với TTL 24 giờ
    await cacheResponse(cacheKey, districts);
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
    // 1. check redis cache
    const cacheKey = `location:wards:${districtId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getWards] Returning from Redis Cache");
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        message: `Lấy danh sách phường/xã của quận/huyện có id ${districtId} thành công (từ cache)`,
      });
    }
    // 2. nếu không có trong cache thì query database
    console.log("🐢 [getWards] Fetching from DB...");
    const wards = await locationModel.getWards(districtId);
    // 3. lưu kết quả vào redis cache với TTL 24 giờ
    await cacheResponse(cacheKey, wards);

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

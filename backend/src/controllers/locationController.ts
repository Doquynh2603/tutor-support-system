/**
 * File: controllers/locationController.js
 * Mục đích: Controller cho quản lý thông tin địa lý
 * Vai trò: Gọi locationModel để xử lý business logic
 */

import { Request, Response } from "express";
import locationModel from "../models/locationModel";
import redisConfig from "../config/redis";
const redisClient = redisConfig.client;
/**
 * Lấy danh sách tỉnh/thành phố
 */
interface Province {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  province_id: string;
}

interface Ward {
  id: string;
  name: string;
  district_id: string;
}

/**
 * ✅ Cache helper function
 */
const cacheResponse = async (
  key: string,
  data: any,
  ttl: number = 86400
): Promise<void> => {
  await redisClient.set(key, JSON.stringify(data), {
    EX: ttl,
  });
};
const getProvinces = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📍 [getProvinces] Request received");
    // 1. check redis cache
    const cacheKey = "location:provinces";
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getProvinces] Returning from Redis Cache");
      res.status(200).json({
        success: true,
        data: JSON.parse(cachedData) as Province[],
        message: "Lấy danh sách tỉnh/thành phố thành công (từ cache)",
      });
      return;
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
  } catch (error: any) {
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

const getDistricts = async (req: Request, res: Response): Promise<void> => {
  const { provinceId } = req.params;
  try {
    // 1. check redis cache
    const cacheKey = `location:districts:${provinceId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (!provinceId) {
      res.status(400).json({
        success: false,
        message: "provinceId is required",
      });
      return;
    }
    if (cachedData) {
      console.log("⚡ [getDistricts] Returning from Redis Cache");
      res.status(200).json({
        success: true,
        data: JSON.parse(cachedData) as District[],
        message: `Lấy danh sách quận huyện của tỉnh có id ${provinceId} thành công (từ cache)`,
      });
      return;
    }
    // 2. nếu không có trong cache thì query database
    console.log("🐢 [getDistricts] Fetching from DB...");
    const districts = await locationModel.getDistricts(provinceId);
    // 3. lưu kết quả vào redis cache với TTL 24 giờ
    await cacheResponse(cacheKey, districts);
    console.log(`✅ [getDistricts] Found ${districts.length} districts`);
    res.status(200).json({
      success: true,
      data: districts,
      message: `Lấy danh sách quận huyện của tỉnh có id ${provinceId} thành công`,
    });
  } catch (error: any) {
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
const getWards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { districtId } = req.params;
    console.log(`📍 [getWards] Request for district: ${districtId}`);
    if (!districtId) {
      res.status(400).json({
        success: false,
        message: "districtId is required",
      });
      return;
    }

    // 1. check redis cache
    const cacheKey = `location:wards:${districtId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [getWards] Returning from Redis Cache");
      res.status(200).json({
        success: true,
        data: JSON.parse(cachedData) as Ward[],
        message: `Lấy danh sách phường/xã của quận/huyện có id ${districtId} thành công (từ cache)`,
      });
      return;
    }
    // 2. nếu không có trong cache thì query database
    console.log("🐢 [getWards] Fetching from DB...");
    const wards = await locationModel.getWards(districtId);
    // 3. lưu kết quả vào redis cache với TTL 24 giờ
    await cacheResponse(cacheKey, wards);
    console.log(`✅ [getWards] Found ${wards.length} wards`);
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
export default {
  getProvinces,
  getDistricts,
  getWards,
};

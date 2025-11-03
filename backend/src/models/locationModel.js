/**
 * File: models/locationModel.js
 * Mục đích: Service layer cho Location management
 * Vai trò: Xử lý business logic cho provinces, wards
 */

const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");

/**
 * Lấy danh sách tất cả tỉnh/thành phố
 * @returns {Array} Danh sách provinces
 */
const getProvinces = async () => {
  try {
    console.log("📍 [getProvinces] Fetching provinces...");

    const query = `
      SELECT id, name 
      FROM Province_Id 
      ORDER BY name ASC
    `;

    const provinces = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    console.log(`✅ [getProvinces] Found ${provinces.length} provinces`);
    return provinces;
  } catch (error) {
    console.error("❌ [getProvinces] Error:", error.message);
    throw new Error(error.message || "Lỗi khi lấy danh sách tỉnh/thành phố");
  }
};

/**
 * Lấy danh sách huyện theo tỉnh
 * @param {BIGINT} provinceId - ID tỉnh/thành phố
 * @returns {Array} Danh sách wards của tỉnh
 */
const getWardsByProvince = async (provinceId) => {
  try {
    console.log(
      `📍 [getWardsByProvince] Fetching wards for province: ${provinceId}`
    );

    if (!provinceId) {
      throw new Error("provinceId là bắt buộc");
    }

    const query = `
      SELECT 
        w.id,
        w.name,
        w.province_id,
        p.name as province_name
      FROM Ward w
      JOIN Province_Id p ON w.province_id = p.id
      WHERE w.province_id = :provinceId
      ORDER BY w.name ASC
    `;

    const wards = await sequelize.query(query, {
      replacements: { provinceId: parseInt(provinceId) },
      type: QueryTypes.SELECT,
    });

    console.log(`✅ [getWardsByProvince] Found ${wards.length} wards`);
    return wards;
  } catch (error) {
    console.error("❌ [getWardsByProvince] Error:", error.message);
    throw new Error(error.message || "Lỗi khi lấy danh sách huyện/quận");
  }
};

/**
 * Lấy danh sách tất cả phường/xã (với province_name)
 * @returns {Array} Danh sách all wards
 */
const getAllWards = async () => {
  try {
    console.log("📍 [getAllWards] Fetching all wards...");

    const query = `
      SELECT 
        w.id,
        w.name,
        w.province_id,
        p.name as province_name
      FROM Ward w
      JOIN Province_Id p ON w.province_id = p.id
      ORDER BY p.name ASC, w.name ASC
    `;

    const wards = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    console.log(`✅ [getAllWards] Found ${wards.length} wards`);
    return wards;
  } catch (error) {
    console.error("❌ [getAllWards] Error:", error.message);
    throw new Error(error.message || "Lỗi khi lấy danh sách phường/xã");
  }
};

module.exports = {
  getProvinces,
  getWardsByProvince,
  getAllWards,
};

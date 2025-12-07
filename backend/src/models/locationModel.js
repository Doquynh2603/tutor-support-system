const { sequelize } = require("../config/sqlserver");
const { QueryTypes } = require("sequelize");

/**
 * Lấy danh sách tỉnh/thành phố
 */
const getProvinces = async () => {
  const query = `SELECT id, name FROM Province_Id ORDER BY name`;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

/**
 * Lấy danh sách quận/huyện theo tỉnh
 */
const getDistricts = async (provinceId) => {
  const query = `SELECT id, name FROM District WHERE province_id = :provinceId ORDER BY name`;
  return await sequelize.query(query, {
    replacements: { provinceId },
    type: QueryTypes.SELECT,
  });
};

/**
 * Lấy danh sách phường/xã theo quận
 */
const getWards = async (districtId) => {
  const query = `SELECT id, name FROM Ward WHERE district_id = :districtId ORDER BY name`;
  return await sequelize.query(query, {
    replacements: { districtId },
    type: QueryTypes.SELECT,
  });
};

/**
 * Lấy tất cả phường/xã
 */
const getAllWards = async () => {
  const query = `SELECT id, name, district_id FROM Ward ORDER BY name`;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

module.exports = { getProvinces, getDistricts, getWards, getAllWards };

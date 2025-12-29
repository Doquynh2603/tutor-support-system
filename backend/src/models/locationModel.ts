import { sequelize } from "../config/sqlserver";
import { QueryTypes } from "sequelize";

// định nghĩa cho kết quả trả về
export interface LocationBase {
  id: string;
  name: string;
}

export interface Ward extends LocationBase {
  district_id: string;
}
/**
 * Lấy danh sách tỉnh/thành phố
 */
const getProvinces = async (): Promise<LocationBase[]> => {
  const query = `SELECT id, name FROM Province_Id ORDER BY name`;
  return await sequelize.query(query, { type: QueryTypes.SELECT });
};

/**
 * Lấy danh sách quận/huyện theo tỉnh
 */
export const getDistricts = async (
  provinceId: string
): Promise<LocationBase[]> => {
  const query = `SELECT id, name FROM District WHERE province_id = :provinceId ORDER BY name`;
  return await sequelize.query<LocationBase>(query, {
    replacements: { provinceId },
    type: QueryTypes.SELECT,
  });
};

/**
 * Lấy danh sách phường/xã theo quận
 */
export const getWards = async (districtId: string): Promise<LocationBase[]> => {
  const query = `SELECT id, name FROM Ward WHERE district_id = :districtId ORDER BY name`;
  return await sequelize.query<LocationBase>(query, {
    replacements: { districtId },
    type: QueryTypes.SELECT,
  });
};

export default {
  getProvinces,
  getDistricts,
  getWards,
};

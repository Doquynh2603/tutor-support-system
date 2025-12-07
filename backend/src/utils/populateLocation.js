const https = require("https");
const { sequelize } = require("../config/sqlserver"); // Import sequelize từ config

function fetchJson(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function populateLocations() {
  console.log("Script started...");
  try {
    console.log("Connecting to DB...");
    await sequelize.authenticate(); // Test connection
    console.log("DB connected successfully.");

    // Truncate tables để fresh data
    console.log("Truncating tables...");
    await sequelize.query("DELETE FROM Province_Id"); // Cascade xóa District và Ward
    console.log("Tables truncated.");

    // 1. Fetch provinces
    console.log("Fetching provinces...");
    const provincesResponse = await fetchJson(
      "https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1"
    );
    const provinces = provincesResponse.data.data;
    console.log(`Fetched ${provinces.length} provinces.`);

    const provinceMap = new Map();
    for (const province of provinces) {
      try {
        const [result] = await sequelize.query(
          `
          INSERT INTO Province_Id (id, name) OUTPUT INSERTED.id
          VALUES (NEWID(), :name)
        `,
          { replacements: { name: province.name } }
        );
        provinceMap.set(province.code, result[0].id);
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          console.log(`Skipped duplicate province: ${province.name}`);
          const [existing] = await sequelize.query(
            `
            SELECT id FROM Province_Id WHERE name = :name
          `,
            { replacements: { name: province.name } }
          );
          if (existing.length > 0)
            provinceMap.set(province.code, existing[0].id);
        } else {
          throw error;
        }
      }
    }
    console.log(`Processed ${provinces.length} provinces.`);

    // 2. Fetch districts
    console.log("Fetching districts...");
    const districtsResponse = await fetchJson(
      "https://vn-public-apis.fpo.vn/districts/getAll?limit=-1"
    );
    const districts = districtsResponse.data.data;
    console.log(`Fetched ${districts.length} districts.`);

    const districtMap = new Map();
    const batchSize = 50;
    for (let i = 0; i < districts.length; i += batchSize) {
      const batch = districts.slice(i, i + batchSize);
      for (const district of batch) {
        const provinceId = provinceMap.get(district.parent_code);
        if (!provinceId) continue;

        try {
          const [result] = await sequelize.query(
            `
            INSERT INTO District (id, name, province_id) OUTPUT INSERTED.id
            VALUES (NEWID(), :name, :provinceId)
          `,
            { replacements: { name: district.name, provinceId } }
          );
          districtMap.set(district.code, result[0].id);
        } catch (error) {
          if (error.name === "SequelizeUniqueConstraintError") {
            console.log(`Skipped duplicate district: ${district.name}`);
            const [existing] = await sequelize.query(
              `
              SELECT id FROM District WHERE name = :name AND province_id = :provinceId
            `,
              { replacements: { name: district.name, provinceId } }
            );
            if (existing.length > 0)
              districtMap.set(district.code, existing[0].id);
          } else {
            throw error;
          }
        }
      }
      console.log(
        `Processed batch ${Math.floor(i / batchSize) + 1} of districts.`
      );
    }
    console.log(`Processed ${districts.length} districts.`);

    // 3. Fetch wards
    console.log("Fetching wards...");
    const wardsResponse = await fetchJson(
      "https://vn-public-apis.fpo.vn/wards/getAll?limit=-1"
    );
    const wards = wardsResponse.data.data;
    console.log(`Fetched ${wards.length} wards.`);

    for (let i = 0; i < wards.length; i += batchSize) {
      const batch = wards.slice(i, i + batchSize);
      for (const ward of batch) {
        const districtId = districtMap.get(ward.parent_code);
        if (!districtId) continue;

        try {
          await sequelize.query(
            `
            INSERT INTO Ward (id, name, district_id)
            VALUES (NEWID(), :name, :districtId)
          `,
            { replacements: { name: ward.name, districtId } }
          );
        } catch (error) {
          if (error.name === "SequelizeUniqueConstraintError") {
            console.log(`Skipped duplicate ward: ${ward.name}`);
          } else {
            throw error;
          }
        }
      }
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1} of wards.`);
    }
    console.log(`Processed ${wards.length} wards.`);

    console.log("Đã populate xong tất cả locations từ API!");
  } catch (error) {
    console.error("Error details:", error);
    console.error("Lỗi khi populate locations:", error.message);
  } finally {
    console.log("Script finished.");
    await sequelize.close();
  }
}

module.exports = populateLocations;
populateLocations();

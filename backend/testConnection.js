/**
 * File: testConnection.js
 * Mục đích: Test SQL Server connection
 * Sử dụng: node testConnection.js
 */

require("dotenv").config();

const testSQLConnection = async () => {
  try {
    console.log("🔧 Environment Variables:");
    console.log("MSSQL_HOST:", process.env.MSSQL_HOST || "localhost");
    console.log("MSSQL_PORT:", process.env.MSSQL_PORT || "1433");
    console.log(
      "MSSQL_DATABASE:",
      process.env.MSSQL_DATABASE || "TutorSupportSystem"
    );
    console.log("MSSQL_USER:", process.env.MSSQL_USER || "sa");
    console.log(
      "MSSQL_PASSWORD:",
      process.env.MSSQL_PASSWORD ? "***" : "NOT SET"
    );

    console.log("\n🔍 Testing SQL Server connection...");

    const { testSQLServerConnection } = require("./src/config/sqlserver");
    const result = await testSQLServerConnection();

    if (result) {
      console.log("✅ SQL Server connection successful!");
      process.exit(0);
    } else {
      console.log("❌ SQL Server connection failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error testing connection:", error.message);
    process.exit(1);
  }
};

testSQLConnection();

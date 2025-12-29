/**
 * SQL Server Configuration with Mock Fallback
 * Sử dụng mock data khi SQL Server không kết nối được
 */

import { Sequelize, Options } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
// Helper function để đọc environment variables
function env(key: string): string | undefined {
  if (process.env[key] !== undefined) return process.env[key];
  const alt = key.replace(/^MSSQL_/, "DB_");
  return process.env[alt];
}

// SQL Server configuration interface
interface SQLConfig {
  database: string;
  username: string;
  password?: string;
  host: string;
  port: number;
  encrypt: boolean;
  trustServerCertificate: boolean;
  integratedSecurity: boolean;
}
// SQL Server configuration
const cfg: SQLConfig = {
  database: env("MSSQL_DATABASE") || "tutorsupportdb",
  username: env("MSSQL_USER") || "sa",
  password: env("MSSQL_PASSWORD") || "12345",
  host: env("MSSQL_HOST") || "localhost",
  port: env("MSSQL_PORT") ? parseInt(env("MSSQL_PORT")!, 10) : 1433,
  encrypt: (env("MSSQL_ENCRYPT") || "false") === "true",
  trustServerCertificate:
    (env("MSSQL_TRUST_SERVER_CERTIFICATE") || "true") !== "false",
  integratedSecurity: (env("MSSQL_INTEGRATED_SECURITY") || "false") === "true",
};

// Host and instance configuration from environment
const instanceName = env("MSSQL_INSTANCE") || undefined;

// Sequelize options
const options = {
  host: cfg.host,
  port: cfg.port,
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: cfg.encrypt,
      trustServerCertificate: cfg.trustServerCertificate,
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000,
      charset: "UTF-8",
      instanceName: instanceName,
    },
  },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /TIMEOUT/,
      /ESOCKET/,
    ],
    max: 3,
  },
};

// Create Sequelize instance
const sequelize = new Sequelize(
  cfg.database,
  (cfg.integratedSecurity ? undefined : cfg.username) as string,
  (cfg.integratedSecurity ? undefined : cfg.password) as string,
  options as Options
);

// Helper function để build log config
function buildLogConfig() {
  return {
    host: cfg.host,
    port: 1433,
    database: cfg.database,
    username: cfg.integratedSecurity ? "Windows Authentication" : cfg.username,
    instance: instanceName || "default",
  };
}

// Connect function - NO MOCK FALLBACK
async function connectSQLServer(): Promise<Sequelize> {
  console.log("SQL Server connect config:", buildLogConfig());
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize authenticated to SQL Server");
    return sequelize;
  } catch (error) {
    console.error("❌ SQL Server connection FAILED - NO MOCK FALLBACK");
    console.error("Error:", error.message);
    throw error; // Throw error instead of returning mock
  }
}

// Test connection function
async function testSQLServerConnection(): Promise<boolean> {
  console.log("🔄 Testing SQL Server connection...");
  console.log("   Config:", buildLogConfig());

  try {
    await sequelize.authenticate();

    const [results] = await sequelize.query(`
      SELECT @@SERVERNAME as server_name,
             @@SERVICENAME as service_name,
             SERVERPROPERTY('InstanceName') as instance_name,
             SERVERPROPERTY('Edition') as edition,
             CONNECTIONPROPERTY('local_tcp_port') as tcp_port,
             DB_NAME() as current_db
    `);

    if (Array.isArray(results) && results.length > 0) {
      const info: any = results[0];
      console.log("📊 SQL Server Info:", {
        server_name: info.server_name,
        service_name: info.service_name,
        instance_name: info.instance_name,
        edition: info.edition,
        tcp_port: info.tcp_port,
        current_db: info.current_db,
      });
    }

    return true;
  } catch (error) {
    console.error(
      "❌ SQL Server connection failed:",
      error && error.message ? error.message : error
    );
    if (error && (error.code === "ESOCKET" || error.code === "ECONNREFUSED")) {
      console.error(
        "   • Connection refused - is the SQL Server instance running?"
      );
      console.error(
        "   • If this is a named instance, ensure SQL Server Browser is running."
      );
      console.error(
        "   • Check TCP/IP settings in SQL Server Configuration Manager."
      );
    }
    if (error && error.original && error.original.number === 18456) {
      console.error(
        "   • Login failed (18456) - check credentials / authentication mode"
      );
    }
    return false;
  }
}

export { sequelize, connectSQLServer, testSQLServerConnection };

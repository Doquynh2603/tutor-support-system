/**
 * File: app.js
 * Mục đích: Cấu hình Express application
 * Vai trò:
 *   - Thiết lập middlewares (security, logging, parsing)
 *   - Đăng ký routes
 *   - Cấu hình Swagger documentation
 *   - Xử lý errors
 * Lưu ý:
 *   - Thứ tự middlewares quan trọng (security trước, error handler cuối)
 *   - CORS origin phải match với frontend URL
 *   - Tất cả routes đều có prefix /api
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");

// Import routes
const userRoutes = require("./routes/users");
const sessionRoutes = require("./routes/sessions");
const tutorRoutes = require("./routes/tutorRoutes");
const searchRoutes = require("./routes/searchRoutes");
const locationRoutes = require("./routes/locationRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const app = express();

// Security & Performance Middlewares
app.use(helmet()); // Bảo vệ app khỏi các lỗ hổng web phổ biến
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression()); // Nén response để tăng tốc
app.use(morgan("dev")); // Log HTTP requests
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// API Documentation - Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint - Kiểm tra server còn sống
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes - Tất cả routes đều có prefix /api
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/applications", applicationRoutes);
// 404 Handler - Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler - Phải đặt cuối cùng
app.use(errorHandler);

module.exports = app;

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

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";

// Import routes
import userRoutes from "./routes/users";
import sessionRoutes from "./routes/sessions";
import tutorRoutes from "./routes/Tutor/tutorRoutes";
import locationRoutes from "./routes/locationRoutes";
import searchRoutes from "./routes/Tutor/searchRoutes";
import subjectsRoutes from "./routes/subjectsRoutes";
import applicationRoutes from "./routes/Tutor/applicationRoutes";
import studentRoutes from "./routes/Student/studentRouter";
import notificationRoutes from "./routes/NotificationRoutes";
import authRoutes from "./routes/auth"; // Thêm authRoutes nếu chưa có trong list cũ của app.js
const app: Application = express();

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
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes - Tất cả routes đều có prefix /api
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notifications", notificationRoutes);
console.log("✅ All routes mounted!");
// 404 Handler - Route không tồn tại
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler - Phải đặt cuối cùng
app.use(errorHandler);

module.exports = app;

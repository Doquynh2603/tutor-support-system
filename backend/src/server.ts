import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Import database configurations
import { connectMongoDB } from "./config/mongodb";
import { sequelize, testSQLServerConnection } from "./config/sqlserver";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import tutorRoutes from "./routes/Tutor/tutorRoutes";
import locationRoutes from "./routes/locationRoutes";
import studentRoutes from "./routes/Student/studentRouter";
import applicationRoutes from "./routes/Tutor/applicationRoutes";
import searchRoutes from "./routes/Tutor/searchRoutes";
import subjectsRoutes from "./routes/subjectsRoutes";
import notificationRoutes from "./routes/NotificationRoutes";

import socketEmitter from "./utils/socketEmitter";
import { errorHandler } from "./middlewares/errorHandler";
import NotificationService from "./service/NotificationService"; // Cần tạo file này hoặc import đúng
import authController from "./controllers/authController"; // Cần tạo file này hoặc import đúng

// Global variables for status
declare global {
  var mongoConnectionStatus: string;
  var dbConnectionStatus: string;
}
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  user?: any;
}
const app = express();

// Body parser middleware
app.use(
  express.json({
    limit: process.env.MAX_JSON_SIZE || "10mb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.MAX_URL_ENCODED_SIZE || "10mb",
  })
);

// Debug middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `▶︎ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("  Body:", req.body);
  }
  next();
});

const server = http.createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
];

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// app.locals.io = io;
socketEmitter.setIO(io);
console.log("✅ SocketEmitter initialized with io instance");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../public")));

// Request logging (dev only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Database Initialization
const initializeDatabases = async () => {
  let mongoConnected = false;
  let sqlConnected = false;

  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongoDB();
    mongoConnected = true;
  } catch (error: any) {
    console.warn("⚠️ MongoDB connection failed:", error.message);
  }

  try {
    console.log("🔄 Connecting to SQL Server...");
    sqlConnected = await testSQLServerConnection();

    if (sqlConnected && process.env.NODE_ENV === "development" && sequelize) {
      console.log("🔄 Syncing Sequelize models...");
      await sequelize.sync({ alter: false });
    }
    if (sqlConnected) {
      console.log("✅ SQL Server connected");
    }
  } catch (error: any) {
    console.warn("⚠️ SQL Server connection failed:", error.message);
  }

  global.mongoConnectionStatus = mongoConnected ? "connected" : "disconnected";
  global.dbConnectionStatus = sqlConnected ? "connected" : "disconnected";

  console.log("📊 Database Status:");
  console.log(`  - MongoDB: ${global.mongoConnectionStatus}`);
  console.log(`  - SQL Server: ${global.dbConnectionStatus}`);
};

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running healthy",
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: {
        mongodb: global.mongoConnectionStatus,
        sqlserver: global.dbConnectionStatus,
      },
    },
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "🎓 Tutor Support System API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "🚀 Tutor Support System API",
    version: "v1",
    status: "active",
    timestamp: new Date().toISOString(),
    database: {
      mongodb: global.mongoConnectionStatus || "disconnected",
      sqlserver: global.dbConnectionStatus || "disconnected",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.IO Configuration
if (process.env.NODE_ENV === "development") {
  io.use(async (socket: AuthenticatedSocket, next) => {
    socket.userId = socket.handshake.auth.userId || "dev-user-1";
    socket.userRole = socket.handshake.auth.userRole || "tutor";
    console.log(
      `✅ Socket connected (DEV): ${socket.userId} (${socket.userRole})`
    );
    next();
  });
} else {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("No token provided"));
      }
      const user = await authController.verifySocketToken(token);
      socket.userId = user.user_id;
      socket.userRole = user.role;
      console.log(`✅ Socket authenticated: ${user.user_id} (${user.role})`);
      next();
    } catch (error: any) {
      console.error("❌ Socket auth failed:", error);
      next(new Error("Authentication failed"));
    }
  });
}

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log(`🔌 User ${socket.userId} connected`);
  socket.join(`user_${socket.userId}`);

  // Join role-based room
  if (socket.userRole === "tutor") {
    socket.join("tutors");
  } else if (socket.userRole === "student") {
    socket.join("students");
  } else if (socket.userRole === "admin") {
    socket.join("admins");
  }
  socket.on("authenticate", (userId: string) => {
    console.log(`📍 [Socket] User ${userId} authenticating...`);
    socket.userId = userId;
    socket.userId = userId;
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`✅ [Socket] User ${userId} joined room: ${userRoom}`);

    // ✅ Emit confirmation
    socket.emit("authenticated", {
      message: "Xác thực thành công",
      userId,
    });
  });

  socket.on("notification:read", async (notificationId: string) => {
    try {
      console.log(
        `📬 Notification ${notificationId} marked as read by ${socket.userId}`
      );
      socket.emit("notification:read:success", { notificationId });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      socket.emit("notification:read:error", { error: error.message });
    }
  });

  socket.on("notification:unread-count", async () => {
    try {
      // ✅ Get unread count (implement in NotificationService)
      socket.emit("notification:unread-count", { count: 0 });
    } catch (error) {
      console.error("Error getting unread count:", error);
    }
  });

  socket.on("tutor:profile:update", async (data: any) => {
    try {
      console.log(`📝 Tutor ${socket.userId} updating profile`);
      socket.to("admins").emit("admin:tutor:profile:updated", {
        tutorId: socket.userId,
        timestamp: new Date().toISOString(),
        changes: data,
      });
      socket.emit("tutor:profile:update:success", {
        message: "Profile update broadcast successful",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error handling profile update event:", error);
      socket.emit("tutor:profile:update:error", {
        message: "Failed to broadcast profile update",
        error: error.message,
      });
    }
  });
  socket.on("message:send", async (data: any) => {
    try {
      const { recipientId, content, type = "text" } = data;
      socket.to(`user_${recipientId}`).emit("message:receive", {
        senderId: socket.userId,
        content,
        type,
        timestamp: new Date().toISOString(),
      });
      socket.emit("message:sent", {
        recipientId,
        timestamp: new Date().toISOString(),
      });
      console.log(`💬 Message sent from ${socket.userId} to ${recipientId}`);
    } catch (error: any) {
      console.error("Error handling message send:", error);
      socket.emit("message:error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  });
  socket.on("application:submit", async (data: any) => {
    try {
      console.log(
        `📋 Application submitted by ${socket.userId} for class ${data.classId}`
      );
      socket.emit("application:submitted", {
        status: "success",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error handling application:", error);
      socket.emit("application:error", { error: error.message });
    }
  });

  socket.on("disconnect", (reason: string) => {
    console.log(`🔌 User ${socket.userId} disconnected: ${reason}`);
  });

  socket.on("error", (error: any) => {
    console.error(`❌ Socket error for user ${socket.userId}:`, error);
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} không tồn tại`,
    error: { statusCode: 404, details: null },
  });
});

app.use(errorHandler);

// Process handlers
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.log("🔄 Server will restart...");
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  console.log("🔄 Server will restart...");
  server.close(() => {
    process.exit(1);
  });
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log("🔄 HTTP server closed");
    try {
      await sequelize.close();
      console.log("🔄 SQL Server connection closed");
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const startServer = async () => {
  try {
    await initializeDatabases();
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || "localhost";

    server.listen(Number(PORT), HOST, () => {
      console.log("🚀 ===============================================");
      console.log(`🚀 TUTOR SUPPORT SYSTEM SERVER STARTED`);
      console.log("🚀 ===============================================");
      console.log(`📍 Server running on: http://${HOST}:${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📍 API Endpoints: http://${HOST}:${PORT}/api`);
      console.log(`📍 Health Check: http://${HOST}:${PORT}/api/health`);
      console.log(`🔌 Socket.IO: Enabled on port ${PORT}`);
      console.log("🚀 ===============================================");
    });

    if (process.env.NODE_ENV === "development") {
      console.log("\n📚 Available API Routes:");
      console.log("  🔐 Auth: /api/auth/*");
      console.log("  👥 Users: /api/users/*");
      console.log("  🎓 Tutors: /api/tutor/*");
      console.log("  📚 Students: /api/student/*");
      console.log("  🏫 Classes: /api/classes/*");
      console.log("  📋 Applications: /api/applications/*");
      console.log("  💬 Messages: /api/messages/*");
      console.log("  ❤️  Health: /api/health\n");
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };

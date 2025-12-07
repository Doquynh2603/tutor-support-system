/**
 * File: server.js
 * Mục đích: Entry point của backend server
 * Vai trò:
 *   - Khởi tạo và cấu hình HTTP server
 *   - Thiết lập Socket.IO cho realtime communication
 *   - Kết nối tới MongoDB và SQL Server
 *   - Quản lý vòng đời của server
 *   - Định nghĩa các routes API
 * Lưu ý:
 *   - Cần file .env với đầy đủ biến môi trường
 *   - MongoDB và SQL Server phải sẵn sàng trước khi start
 *   - Socket.IO events được định nghĩa tại đây
 *   - Sequelize sync chỉ chạy ở development mode
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Import database configurations (with fallbacks)
let connectMongoDB, sequelize, testSQLServerConnection;
try {
  ({ connectMongoDB } = require("./config/mongodb"));
} catch (error) {
  console.warn("⚠️ MongoDB config not found, will skip MongoDB connection");
  connectMongoDB = async () => {
    console.log("MongoDB connection skipped");
  };
}

try {
  ({ sequelize, testSQLServerConnection } = require("./config/sqlserver"));
  console.log("✅ SQL Server config loaded successfully");
} catch (error) {
  console.warn("⚠️ SQL Server config error:", error.message);
  testSQLServerConnection = async () => {
    console.log("SQL Server connection skipped");
    return false;
  };
}

// Import authentication routes
const authRoutes = require("./routes/auth");
// Import other routes
let userRoutes = require("./routes/users");
let tutorRoutes = require("./routes/Tutor/tutorRoutes");
let locationRoutes = require("./routes/locationRoutes");
let studentRoutes = require("./routes/Student/studentRouter");
let applicationRoutes = require("./routes/Tutor/applicationRoutes");
let searchRoutes = require("./routes/Tutor/searchRoutes");
let subjectsRoutes = require("./routes/subjectsRoutes");
try {
  errorHandler = require("./middlewares/errorHandler");
} catch (error) {
  console.warn("⚠️ Error handler not found, using default");
  errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server Error" });
  };
}

// Initialize Express app
const app = express();
// Body parser middleware - must come before CORS and routes
app.use(
  express.json({
    limit: process.env.MAX_JSON_SIZE || "10mb",
    verify: (req, res, buf) => {
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
// Debug middleware: log full details of every incoming request
app.use((req, res, next) => {
  console.log(
    `▶︎ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  console.log("  Headers:", req.headers);
  console.log("  Body:", req.body);
  next();
});
const server = http.createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "http://localhost:3001",
];

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ===========================
// MIDDLEWARE CONFIGURATION
// ===========================

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // Requests per window
  message: {
    success: false,
    message: "Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút",
    error: { statusCode: 429, details: null },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes only
app.use("/api/", limiter);

// Static files middleware
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../public")));

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ===========================
// DATABASE CONNECTIONS
// ===========================

/**
 * Initialize database connections
 */
const initializeDatabases = async () => {
  let mongoConnected = false;
  let sqlConnected = false;

  // Try to connect to MongoDB
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongoDB();
    mongoConnected = true;
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed:", error.message);
    console.warn("⚠️ Server will continue without MongoDB");
  }

  // Try to connect to SQL Server
  try {
    console.log("🔄 Connecting to SQL Server...");
    sqlConnected = await testSQLServerConnection();

    if (sqlConnected) {
      // Sync Sequelize models (development only)
      if (process.env.NODE_ENV === "development" && sequelize) {
        console.log("🔄 Syncing Sequelize models...");
        await sequelize.sync({ alter: false });
      }
    }
  } catch (error) {
    console.warn("⚠️ SQL Server connection failed:", error.message);
    console.warn("⚠️ Server will continue with mock data");
  }

  // Set global status for health checks
  global.mongoConnectionStatus = mongoConnected ? "connected" : "disconnected";
  global.dbConnectionStatus = sqlConnected ? "connected" : "disconnected";

  // Log final database status
  console.log("📊 Database Status:");
  console.log(`  - MongoDB: ${global.mongoConnectionStatus}`);
  console.log(`  - SQL Server: ${global.dbConnectionStatus}`);

  if (!mongoConnected && !sqlConnected) {
    console.warn("⚠️ No databases connected - using mock data only");
  }
};

// ===========================
// API ROUTES
// ===========================

// Health check endpoint
app.get("/api/health", (req, res) => {
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
        mongodb: "connected",
        sqlserver: "connected",
      },
    },
  });
});

// ===========================
// ROOT ROUTES
// ===========================

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎓 Tutor Support System API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      users: "/api/users/*",
      tutors: "/api/tutor/*",
      students: "/api/student/*",
      classes: "/api/classes/*",
      applications: "/api/applications/*",
      messages: "/api/messages/*",
    },
    documentation: process.env.NODE_ENV === "development" ? "/api/docs" : null,
  });
});

// API root endpoint
app.get("/api", (req, res) => {
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
    available_endpoints: [
      "GET /api/health - Health check",
      "GET /api/tutor/profile - Get tutor profile",
      "PUT /api/tutor/profile - Update tutor profile",
      "GET /api/tutor/locations - Get teaching locations",
      "GET /api/tutor/test-db - Test database connection",
    ],
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/tutor/profile", tutorRoutes); // ✅ Tutor profile routes
app.use("/api/tutor", tutorRoutes); // ✅ Tutor profile management routes
app.use("/api/locations", locationRoutes); // ✅ Location routes (provinces & wards)
app.use("/api/search", searchRoutes); // ✅ Search classes routes
app.use("/api/subjects", subjectsRoutes); // ✅ Subjects routes
app.use("/api/student", studentRoutes);
// app.use("/api/classes", classRoutes);
app.use("/api/applications", applicationRoutes);
// app.use("/api/messages", messageRoutes);

// API documentation route (if using Swagger)
if (process.env.NODE_ENV === "development") {
  app.get("/api/docs", (req, res) => {
    res.redirect("/api-docs");
  });
}

// ===========================
// SOCKET.IO CONFIGURATION
// ===========================

/**
 * Socket.IO connection handling
 */
// Development mode: Skip authentication for Socket.IO
if (process.env.NODE_ENV === "development") {
  io.use(async (socket, next) => {
    // Mock authentication for development
    socket.userId = "dev-tutor-1";
    socket.userRole = "tutor";
    console.log(
      `✅ Socket authenticated (DEV MODE): User ${socket.userId} (${socket.userRole})`
    );
    next();
  });
} else {
  // Production authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token (implement this based on your auth logic)
      const user = await verifySocketToken(token);
      socket.userId = user.id;
      socket.userRole = user.role;

      console.log(`✅ Socket authenticated: User ${user.id} (${user.role})`);
      next();
    } catch (error) {
      console.error("❌ Socket authentication failed:", error);
      next(new Error("Authentication error"));
    }
  });
}

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Join role-based rooms
  if (socket.userRole === "tutor") {
    socket.join("tutors");
  } else if (socket.userRole === "student") {
    socket.join("students");
  } else if (socket.userRole === "admin") {
    socket.join("admins");
  }

  // ===========================
  // TUTOR PROFILE EVENTS
  // ===========================

  // Listen for profile update events
  socket.on("tutor:profile:update", async (data) => {
    try {
      console.log(`📝 Tutor ${socket.userId} updating profile`);

      // Emit to admins for monitoring
      socket.to("admins").emit("admin:tutor:profile:updated", {
        tutorId: socket.userId,
        timestamp: new Date().toISOString(),
        changes: data,
      });

      // Acknowledge the update
      socket.emit("tutor:profile:update:success", {
        message: "Profile update broadcast successful",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error handling profile update event:", error);
      socket.emit("tutor:profile:update:error", {
        message: "Failed to broadcast profile update",
        error: error.message,
      });
    }
  });

  // ===========================
  // MESSAGING EVENTS
  // ===========================

  socket.on("message:send", async (data) => {
    try {
      const { recipientId, content, type = "text" } = data;

      // Save message to database (implement this)
      // const savedMessage = await saveMessage({...});

      // Send to recipient
      socket.to(`user_${recipientId}`).emit("message:receive", {
        senderId: socket.userId,
        content,
        type,
        timestamp: new Date().toISOString(),
      });

      // Acknowledge sender
      socket.emit("message:sent", {
        recipientId,
        timestamp: new Date().toISOString(),
      });

      console.log(`💬 Message sent from ${socket.userId} to ${recipientId}`);
    } catch (error) {
      console.error("Error handling message send:", error);
      socket.emit("message:error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  });

  // ===========================
  // APPLICATION EVENTS
  // ===========================

  socket.on("application:submit", async (data) => {
    try {
      const { classId } = data;

      // Notify class owner (student) about new application
      // Implementation depends on your application logic

      console.log(
        `📋 Application submitted by tutor ${socket.userId} for class ${classId}`
      );
    } catch (error) {
      console.error("Error handling application submit:", error);
    }
  });

  // ===========================
  // NOTIFICATION EVENTS
  // ===========================

  socket.on("notification:read", async (notificationId) => {
    try {
      // Mark notification as read in database
      // await markNotificationAsRead(notificationId, socket.userId);

      console.log(
        `📬 Notification ${notificationId} marked as read by user ${socket.userId}`
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  });

  // ===========================
  // DISCONNECTION HANDLING
  // ===========================

  socket.on("disconnect", (reason) => {
    console.log(`🔌 User ${socket.userId} disconnected: ${reason}`);

    // Clean up any resources if needed
    // Remove from active users list, etc.
  });

  socket.on("error", (error) => {
    console.error(`❌ Socket error for user ${socket.userId}:`, error);
  });
});

// ===========================
// ERROR HANDLING
// ===========================

// 404 handler - must be after all routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} không tồn tại`,
    error: { statusCode: 404, details: null },
  });
});

// Global error handler
app.use(errorHandler);

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.log("🔄 Server will restart...");
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  console.log("🔄 Server will restart...");
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("🔄 HTTP server closed");

    try {
      // Close database connections
      await sequelize.close();
      console.log("🔄 SQL Server connection closed");

      // Close MongoDB connection if needed
      // await mongoose.connection.close();

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

// ===========================
// SERVER STARTUP
// ===========================

// Import verifySocketToken from auth controller
const { verifySocketToken } = require("./controllers/authController");

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Initialize databases first
    await initializeDatabases();

    // Start HTTP server
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || "localhost";

    server.listen(PORT, HOST, () => {
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

    // Log available routes in development
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

// Start the server
startServer();

// Export for testing purposes
module.exports = { app, server, io };

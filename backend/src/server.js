/**
 * File: server.js
 * Mục đích: Entry point của backend server
 * Vai trò:
 *   - Khởi tạo và cấu hình HTTP server
 *   - Thiết lập Socket.IO cho realtime communication
 *   - Kết nối tới MongoDB và SQL Server
 *   - Quản lý vòng đời của server
 * Lưu ý:
 *   - Cần file .env với đầy đủ biến môi trường
 *   - MongoDB và SQL Server phải sẵn sàng trước khi start
 *   - Socket.IO events được định nghĩa tại đây
 *   - Sequelize sync chỉ chạy ở development mode
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const connectMongoDB = require('./config/mongodb');
const { connectSQLServer, sequelize } = require('./config/sqlserver');

const PORT = process.env.PORT || 5000;

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Khởi tạo Socket.IO với cấu hình CORS
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO - Xử lý kết nối realtime
io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // Join room - Client tham gia một phòng cụ thể
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`📥 Client ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Leave room - Client rời khỏi phòng
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`📤 Client ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit('user-left', socket.id);
  });

  // Chat message - Broadcast tin nhắn trong phòng
  socket.on('chat-message', ({ roomId, message }) => {
    io.to(roomId).emit('chat-message', {
      userId: socket.id,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Notification - Gửi thông báo đến user cụ thể
  socket.on('send-notification', ({ userId, notification }) => {
    io.to(userId).emit('notification', notification);
  });

  // Disconnect - Xử lý khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Expose Socket.IO instance để các routes có thể sử dụng
app.set('io', io);

/**
 * Hàm khởi động server
 * - Kết nối đến các database
 * - Sync database models (chỉ ở development)
 * - Start HTTP server
 */
const startServer = async () => {
  try {
    // Kết nối MongoDB
    // await connectMongoDB();

    // Kết nối SQL Server
    // await connectSQLServer();

    // Sync SQL Server models (chỉ development, tránh mất data ở production)
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('✅ SQL Server models synced');
    // }

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔌 Socket.IO ready for connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Xử lý unhandled promise rejection để tránh crash không mong muốn
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

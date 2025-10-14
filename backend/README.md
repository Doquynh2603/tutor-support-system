# Backend - Tutor Support System

Backend cho hệ thống hỗ trợ gia sư được xây dựng với NodeJS, ExpressJS, MongoDB và SQL Server.

## 🚀 Công nghệ sử dụng

- **NodeJS** - Runtime environment
- **ExpressJS** - Web framework
- **MongoDB** - NoSQL database (với Mongoose ORM)
- **SQL Server** - Relational database (với Sequelize ORM)
- **Socket.IO** - Realtime communication
- **Swagger** - API documentation
- **JWT** - Authentication
- **Helmet** - Security

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Database & app configuration
│   │   ├── mongodb.js
│   │   ├── sqlserver.js
│   │   └── swagger.js
│   ├── controllers/     # Request handlers
│   │   ├── userController.js
│   │   └── sessionController.js
│   ├── models/          # Database models
│   │   ├── User.js      # MongoDB model
│   │   └── Session.js   # SQL Server model
│   ├── routes/          # API routes
│   │   ├── users.js
│   │   └── sessions.js
│   ├── middlewares/     # Custom middlewares
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── utils/           # Utility functions
│   │   └── responseFormatter.js
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── package.json
├── Dockerfile
└── README.md
```

## 🛠️ Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- MongoDB >= 6.x
- SQL Server 2019 hoặc mới hơn

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd tutor-support-system/backend
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình environment

Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tutor_support_system

# SQL Server
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=tutor_support_system
MSSQL_USER=sa
MSSQL_PASSWORD=YourPassword

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Bước 4: Khởi động server

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Documentation

Sau khi khởi động server, truy cập Swagger UI tại:

```
http://localhost:5000/api-docs
```

## 🐳 Docker

### Build image

```bash
docker build -t tutor-backend .
```

### Run container

```bash
docker run -p 5000:5000 --env-file .env tutor-backend
```

## 📡 Socket.IO Events

### Client → Server

- `join-room`: Tham gia phòng
- `leave-room`: Rời phòng
- `chat-message`: Gửi tin nhắn
- `send-notification`: Gửi thông báo

### Server → Client

- `user-joined`: User mới tham gia
- `user-left`: User rời phòng
- `chat-message`: Nhận tin nhắn
- `notification`: Nhận thông báo

## 🔌 API Endpoints

### Users (MongoDB)

- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy thông tin user
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Sessions (SQL Server)

- `GET /api/sessions` - Lấy danh sách sessions
- `GET /api/sessions/:id` - Lấy thông tin session
- `POST /api/sessions` - Tạo session mới
- `PUT /api/sessions/:id` - Cập nhật session
- `DELETE /api/sessions/:id` - Xóa session

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm start` - Chạy production server
- `npm run dev` - Chạy development server với nodemon
- `npm test` - Chạy tests

## 🔒 Security

- **Helmet**: Bảo vệ app khỏi các lỗ hổng web phổ biến
- **CORS**: Kiểm soát cross-origin requests
- **JWT**: Token-based authentication
- **Password hashing**: Sử dụng bcrypt

## 📄 License

ISC

## 👥 Contributors

Tutor Support System Team

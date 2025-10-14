# Tutor Support System 🎓

Hệ thống hỗ trợ gia sư toàn diện được xây dựng với công nghệ hiện đại, bao gồm backend API và frontend web application.

## 📋 Tổng quan

Dự án bao gồm 2 phần chính:

- **Backend**: RESTful API với NodeJS, ExpressJS, MongoDB, SQL Server, Socket.IO
- **Frontend**: Web application với React, TypeScript, Redux Toolkit, shadcn/ui

## 🏗️ Kiến trúc hệ thống

```
tutor-support-system/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database & app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── utils/          # Utility functions
│   │   ├── app.js          # Express app
│   │   └── server.js       # Server entry point
│   ├── .env                # Environment variables
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/               # Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   ├── lib/            # Utilities
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## 🚀 Công nghệ sử dụng

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Databases**:
  - MongoDB 7 (NoSQL) với Mongoose ORM
  - SQL Server 2022 (Relational) với Sequelize ORM
- **Realtime**: Socket.IO
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, JWT
- **Other**: bcrypt, compression, morgan

### Frontend
- **Framework**: React 18 với TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui với Tailwind CSS
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Realtime**: Socket.IO Client
- **Code Quality**: ESLint, Prettier

## 📦 Cài đặt nhanh

### Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- MongoDB >= 6.x
- SQL Server 2019+
- Docker & Docker Compose (optional)

### Option 1: Sử dụng Docker (Khuyến nghị)

**Bước 1**: Clone repository

```bash
git clone <repository-url>
cd tutor-support-system
```

**Bước 2**: Chạy toàn bộ hệ thống với Docker Compose

```bash
docker-compose up -d
```

Các service sẽ được khởi động:
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **MongoDB**: localhost:27017
- **SQL Server**: localhost:1433

**Bước 3**: Dừng hệ thống

```bash
docker-compose down
```

Để xóa cả volumes (database data):

```bash
docker-compose down -v
```

### Option 2: Cài đặt Manual

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa file .env với thông tin database của bạn
npm run dev
```

Backend chạy tại: http://localhost:5000

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Chỉnh sửa file .env nếu cần
npm run dev
```

Frontend chạy tại: http://localhost:3000

## 📚 API Documentation

Sau khi khởi động backend, truy cập Swagger UI tại:

```
http://localhost:5000/api-docs
```

### API Endpoints chính

#### Users (MongoDB)
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy thông tin user
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

#### Sessions (SQL Server)
- `GET /api/sessions` - Lấy danh sách sessions
- `GET /api/sessions/:id` - Lấy thông tin session
- `POST /api/sessions` - Tạo session mới
- `PUT /api/sessions/:id` - Cập nhật session
- `DELETE /api/sessions/:id` - Xóa session

## 🔌 Socket.IO Events

### Client → Server
- `join-room` - Tham gia phòng
- `leave-room` - Rời phòng
- `chat-message` - Gửi tin nhắn
- `send-notification` - Gửi thông báo

### Server → Client
- `user-joined` - User mới tham gia
- `user-left` - User rời phòng
- `chat-message` - Nhận tin nhắn
- `notification` - Nhận thông báo

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Chạy với nodemon
```

### Frontend Development

```bash
cd frontend
npm run dev  # Chạy Vite dev server
```

### Linting & Formatting

**Backend:**
```bash
cd backend
# Backend chưa có ESLint, có thể thêm sau
```

**Frontend:**
```bash
cd frontend
npm run lint      # Chạy ESLint
npm run format    # Format code với Prettier
```

## 🏗️ Build Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## 🐳 Docker Commands

### Build images

```bash
# Build tất cả
docker-compose build

# Build riêng lẻ
docker-compose build backend
docker-compose build frontend
```

### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services

```bash
docker-compose restart backend
docker-compose restart frontend
```

## 📁 Cấu trúc Database

### MongoDB Collections
- **users**: Lưu thông tin người dùng (students, tutors, admins)

### SQL Server Tables
- **sessions**: Lưu thông tin buổi học

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tutor_support_system
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=tutor_support_system
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong@Passw0rd
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 TODO / Roadmap

- [ ] Thêm authentication & authorization
- [ ] Implement user roles & permissions
- [ ] Tạo thêm UI components với shadcn/ui
- [ ] Thêm unit tests & integration tests
- [ ] Implement chat realtime đầy đủ
- [ ] Tạo dashboard cho admin
- [ ] Thêm tính năng tìm kiếm & filter
- [ ] Implement file upload
- [ ] Thêm notifications system
- [ ] Setup CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 👥 Team

Tutor Support System Development Team

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub repository.

---

**Happy Coding! 🚀**

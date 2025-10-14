# Frontend - Tutor Support System

Frontend cho hệ thống hỗ trợ gia sư được xây dựng với React, TypeScript, Redux Toolkit và shadcn/ui.

## 🚀 Công nghệ sử dụng

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Query** - Data fetching
- **Socket.IO Client** - Realtime communication
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   └── LoginPage.tsx
│   ├── hooks/           # Custom hooks
│   │   ├── useSocket.ts
│   │   └── useUsers.ts
│   ├── store/           # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   │       └── authSlice.ts
│   ├── services/        # API services
│   │   ├── api.ts
│   │   ├── socketService.ts
│   │   └── userService.ts
│   ├── lib/             # Utilities
│   │   └── utils.ts
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc
├── Dockerfile
└── README.md
```

## 🛠️ Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd tutor-support-system/frontend
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình environment

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Bước 4: Khởi động development server

```bash
npm run dev
```

Application sẽ chạy tại: `http://localhost:3000`

## 🏗️ Build Production

```bash
npm run build
```

Build output sẽ được tạo trong thư mục `dist/`.

## 🐳 Docker

### Build image

```bash
docker build -t tutor-frontend .
```

### Run container

```bash
docker run -p 80:80 tutor-frontend
```

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint
- `npm run format` - Format code với Prettier

## 🎨 Thêm shadcn/ui Components

Sử dụng CLI để thêm components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# ... và các components khác
```

## 🔌 Socket.IO Usage

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const socketService = useSocket();

  const handleJoinRoom = (roomId: string) => {
    socketService.joinRoom(roomId);
  };

  const handleSendMessage = (roomId: string, message: string) => {
    socketService.sendMessage(roomId, message);
  };

  // ...
}
```

## 🗃️ Redux Store Usage

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

function MyComponent() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogin = (user, token) => {
    dispatch(setCredentials({ user, token }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };
}
```

## 📡 React Query Usage

```typescript
import { useUsers, useCreateUser } from '@/hooks/useUsers';

function UserList() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();

  const handleCreate = async (userData) => {
    await createUser.mutateAsync(userData);
  };

  // ...
}
```

## 🎨 Tailwind CSS

Sử dụng utility classes của Tailwind CSS:

```tsx
<div className="flex items-center justify-center min-h-screen bg-gray-100">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</div>
```

## 📄 License

ISC

## 👥 Contributors

Tutor Support System Team

# 📋 Hướng Dẫn Setup Database Procedures

## ⚠️ BƯỚC CẦN THIẾT TRƯỚC KHI CHẠY BACKEND

Stored Procedure `sp_SearchClasses` cần được tạo trong SQL Server trước khi backend hoạt động.

### Cách 1: Chạy Script bằng SQL Server Management Studio (SSMS)

1. Mở **SQL Server Management Studio**
2. Kết nối đến SQL Server (localhost, port 1433)
3. Chọn Database: `tutor_support_system`
4. Mở file: `backend/migrations/001_create_sp_search_classes.sql`
5. Click **Execute** (F5) để chạy script

### Cách 2: Chạy bằng Command Line

```bash
# Sử dụng sqlcmd (nếu có)
sqlcmd -S localhost -U sa -P YourPassword -d tutor_support_system -i backend/migrations/001_create_sp_search_classes.sql
```

### Cách 3: Chạy Procedure khác (nếu cần)

Tất cả các migration SQL nằm trong folder: `backend/migrations/`

---

## ✅ Kiểm Tra Procedure Đã Tạo

```sql
-- Chạy query này để verify
SELECT * FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_NAME = 'sp_SearchClasses';
```

Nếu có kết quả thì procedure đã được tạo thành công! ✅

---

## 🚀 Sau khi chạy SQL script

1. Khởi động backend:

```bash
cd backend
npm run dev
```

2. Frontend sẽ tự động connect và search sẽ hoạt động! 🎯

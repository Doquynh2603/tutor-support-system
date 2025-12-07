# Student Class Management - Complete Implementation Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Routes:                                                    │
│  • /student/my-classes       → ManageClassesPage           │
│  • /student/create-class     → CreateClassPage             │
│                                                              │
│  Components:                                                │
│  • ClassFormStep1.tsx   (Basic info)                        │
│  • ClassFormStep2.tsx   (Tutor selection)                   │
│  • ManageClassesPage.tsx (Expandable list)                  │
│                                                              │
│  Redux Store:                                               │
│  • classesSlice.ts (Form data, tutor selection)             │
│                                                              │
│  Services:                                                  │
│  • classService.ts (API wrapper)                            │
│  • api.ts (classAPI export)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/API
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js/Node.js)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Routes (/api/student):                                     │
│  • POST   /class               → createClass               │
│  • GET    /class               → getStudentClasses          │
│  • GET    /class/:class_id     → getClassDetails            │
│  • GET    /class/suggested-tutors → getSuggestedTutors     │
│  • POST   /class/:class_id/invite → inviteSingleTutor      │
│  • POST   /class/:class_id/approve → approveApplication    │
│                                                              │
│  Controller:                                                │
│  • ClassController.js (HTTP handlers)                       │
│                                                              │
│  Model:                                                     │
│  • classModel.js (SQL queries with JOINs)                   │
│                                                              │
│  Database:                                                  │
│  • SQL Server (Sequelize ORM)                               │
│  • Stored Procedures (sp_CreateClass, etc.)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Viewing Classes

### User Journey: "Quản Lý Lớp Học"

```
1. User clicks "📚 Quản lý lớp học" in DevNavigation
   ↓
2. Navigate to /student/my-classes
   ↓
3. ManageClassesPage mounts
   ↓
4. useClass.getMyClasses() called
   ↓
5. API Request: GET /api/student/class
   ↓
6. Backend ClassController.getStudentClasses()
   ↓
7. ClassModel.getStudentClasses(studentId, status?)
   ↓
   SQL Query:
   SELECT c.*,
          u.name as tutor_name,
          u.email as tutor_email,
          u.phone as tutor_phone,
          tp.rating as tutor_rating,
          tp.reviews as tutor_reviews,
          tp.description as tutor_description
   FROM Classes c
   LEFT JOIN UserAccount u ON c.tutor_id = u.user_id
   LEFT JOIN TutorProfile tp ON u.user_id = tp.user_id
   WHERE c.student_id = @studentId
   AND (c.status = @status OR @status IS NULL)
   ↓
8. Response: ClassItem[]
   ↓
9. Frontend: Filter by default status = 'recruiting'
   ↓
10. Display in ManageClassesPage with:
    - Summary card (collapsed)
    - Tutor info (expanded when clicked)
```

---

## ManageClassesPage Features

### 1. Status Filter Bar

- Buttons: "Tất Cả", "Tìm Gia Sư", "Có Gia Sư", "Đang Học", "Đã Kết Thúc"
- Default selected: 'recruiting' (Tìm Gia Sư)
- Each button filters classes by status

### 2. Class Card - Collapsed View

```
┌─────────────────────────────────────────────────────────┐
│  Toán Học                                      ▼         │
│  Tìm gia sư dạy toán cấp 2 tại Hà Nội        [Badge]   │
├─────────────────────────────────────────────────────────┤
│ Giá/Giờ: 200,000 VNĐ │ Lịch: 2 buổi/tuần │ Ứng: 3  │   │
│ Gia Sư: ✅ Có          │                                   │
└─────────────────────────────────────────────────────────┘
```

### 3. Class Card - Expanded View (when clicked)

```
┌─────────────────────────────────────────────────────────┐
│  Toán Học                                      ▲         │
│  Tìm gia sư dạy toán cấp 2 tại Hà Nội        [Badge]   │
├─────────────────────────────────────────────────────────┤
│ Giá/Giờ: 200,000 VNĐ │ Lịch: 2 buổi/tuần │ Ứng: 3     │
│ Gia Sư: ✅ Có          │                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📋 Thông Tin Gia Sư                                    │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Tên: Nguyễn Văn A                               │   │
│ │                                                   │   │
│ │ 📧 nguyena@example.com                          │   │
│ │ 📞 0912-345-678                                 │   │
│ │ ⭐ 4.8 / 5.0 (42 đánh giá)                      │   │
│ │                                                   │   │
│ │ Giới thiệu:                                      │   │
│ │ Có kinh nghiệm dạy toán 10+ năm, chuyên dạy    │   │
│ │ các lớp cấp 2-3. Phương pháp dạy hiệu quả...  │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ [Xem Chi Tiết] [Mời Gia Sư]                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4. When No Tutor Assigned

```
┌─────────────────────────────────────────────────────────┐
│ ℹ️ Chưa có gia sư - Hãy mời hoặc chờ gia sư ứng tuyển   │
├─────────────────────────────────────────────────────────┤
│ [Xem Chi Tiết] [Mời Gia Sư]                            │
└─────────────────────────────────────────────────────────┘
```

---

## Redux State Management

### classesSlice State Structure

```typescript
{
  // Form Creation Data
  formData: {
    subject_id: "1",
    description: "Tìm gia sư dạy toán",
    requirement: "Có kinh nghiệm",
    hourly_price: "200000",
    schedules: [
      { day_of_week: "Monday", start_time: "09:00", end_time: "10:00" },
      { day_of_week: "Wednesday", start_time: "14:00", end_time: "15:00" }
    ]
  },

  // Tutor Selection (array, not Set)
  selectedTutors: ["123", "456", "789"],
  suggestedTutors: [
    {
      tutor_id: "123",
      name: "Nguyễn Văn A",
      email: "a@example.com",
      rating: 4.8,
      reviews: 42
    },
    ...
  ],

  // Class Discovery
  allClasses: [ /* ClassItem[] */ ],
  filteredClasses: [ /* ClassItem[] */ ],
  filters: { /* ClassFilters */ },

  loading: false,
  error: null,
  lastFetched: 1234567890
}
```

### Actions Available

```typescript
// Form actions
setFormData(partialData); // Update form data
addSchedule(); // Add new schedule
removeSchedule(index); // Remove schedule
updateSchedule({ index, field, value }); // Update schedule field
resetFormData(); // Reset form to initial state

// Tutor selection
toggleTutorSelection(tutorId); // Add/remove tutor
setSuggestedTutors(tutors); // Set suggested tutors
clearSelectedTutors(); // Clear all selections

// Class filtering
filterClasses(filters); // Filter classes
resetFilters(); // Reset filters
clearClasses(); // Clear all data
```

---

## API Endpoints & Contracts

### 1. Create Class

```
POST /api/student/class
Body: {
  subject_id: string,
  description: string,
  requirement?: string,
  hourly_price: number,
  schedules: [{day_of_week, start_time, end_time}, ...]
}
Response: {
  success: true,
  message: "Tạo lớp học thành công",
  data: { class_id, status: "recruiting", message: "..." }
}
```

### 2. Get Student's Classes

```
GET /api/student/class?status=recruiting
Response: {
  success: true,
  message: "Danh sách lớp học của học viên",
  data: [
    {
      class_id, subject_id, subject_name, description,
      hourly_price, schedule_count, status,
      tutor_id, tutor_name, tutor_email, tutor_phone,
      tutor_rating, tutor_reviews, tutor_description,
      invited_tutors_count, applied_tutors_count
    },
    ...
  ]
}
```

### 3. Get Suggested Tutors

```
GET /api/student/class/suggested-tutors?subject_id=1
Response: {
  success: true,
  message: "Danh sách gia sư gợi ý",
  data: [
    {
      tutor_id, name, email, phone,
      rating, reviews, description
    },
    ...
  ]
}
```

### 4. Invite Tutor

```
POST /api/student/class/:class_id/invite
Body: { class_id, tutor_id }
Response: {
  success: true,
  message: "Mời gia sư thành công",
  data: { class_id, tutor_id, status: "invited" }
}
```

### 5. Approve Application

```
POST /api/student/class/:class_id/approve
Body: { application_id }
Response: {
  success: true,
  message: "Duyệt ứng tuyển thành công",
  data: { application_id, is_locked: true }
}
```

---

## TypeScript Types

### ClassItem (from backend)

```typescript
interface ClassItem {
  class_id: string;
  subject_id: string;
  subject_name?: string;
  description: string;
  requirement?: string;
  hourly_price: number;
  status: "recruiting" | "has_tutor" | "active" | "closed";

  // Tutor info (nullable)
  tutor_id?: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  tutor_rating?: number;
  tutor_reviews?: number;
  tutor_description?: string;

  schedule_count?: number;
  invited_tutors_count?: number;
  applied_tutors_count?: number;
}
```

### Tutor

```typescript
interface Tutor {
  tutor_id: string;
  name: string;
  email?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  description?: string;
}
```

### ClassFormState

```typescript
interface ClassFormState {
  subject_id: string;
  description: string;
  requirement?: string;
  hourly_price: string;
  schedules: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
}
```

---

## Error Handling

### Frontend Error States

1. **Loading** - Show spinner
2. **Error** - Show error alert with message
3. **Empty State** - Show "Không có lớp học nào"
4. **Network Error** - Caught by apiClient interceptor, redirect to login if 401

### Backend Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

Status Codes:

- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

## Debugging Tips

1. **Redux State Check**

   ```
   Redux DevTools → Action History → Look for classesSlice actions
   Check selectedTutors is string[], not Set
   ```

2. **API Calls Check**

   ```
   Browser DevTools → Network → Look for /api/student/class requests
   Check request/response in console logs
   ```

3. **TypeScript Errors**

   ```
   Run: npx tsc --noEmit
   Fix any critical errors (not warnings)
   ```

4. **Component Rendering**
   ```
   Check ManageClassesPage renders with default filter = 'recruiting'
   Click card to verify expand/collapse works
   Check tutor details show when tutor_id !== null
   ```

---

## Performance Considerations

1. **Memoization**

   - useCallback for event handlers
   - useMemo for computed values

2. **Caching**

   - classesSlice has lastFetched timestamp
   - Could implement stale-while-revalidate pattern

3. **Pagination**

   - Not implemented yet, could add with offset/limit parameters

4. **Sorting**
   - Could add sorting by price, rating, date created

---

## Future Enhancements

1. [ ] Add class search/filter by name
2. [ ] Add sorting options (price, date, rating)
3. [ ] Add pagination for class list
4. [ ] Add class statistics dashboard
5. [ ] Add class cancellation
6. [ ] Add class rescheduling
7. [ ] Add tutor review system
8. [ ] Add class completion tracking

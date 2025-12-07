# Manual Testing Checklist - Student Class Management

## Pre-Testing Setup

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Database connected and populated
- [ ] User logged in as student

---

## Test 1: Navigate to "Quản Lý Lớp Học"

**Steps:**

1. Click "📚 Quản lý lớp học" in DevNavigation
2. Should navigate to `/student/my-classes`

**Expected Result:**

- ✅ Page loads successfully
- ✅ Header shows "Quản Lý Lớp Học"
- ✅ "Tạo Lớp Mới" button visible in top right
- ✅ Status filter buttons visible (Tất Cả, Tìm Gia Sư, Có Gia Sư, Đang Học, Đã Kết Thúc)

**Debug:**

```
Browser Console:
- Check for any React errors
- Look for API request logs in console
- Verify token is being sent with request
```

---

## Test 2: Default Filter = "Recruiting"

**Steps:**

1. Load ManageClassesPage
2. Observe which filter button is selected

**Expected Result:**

- ✅ "Tìm Gia Sư" button appears selected/highlighted
- ✅ Only classes with status = 'recruiting' are displayed
- ✅ Classes with status 'has_tutor', 'active', 'closed' are hidden

**Debug:**

```
Redux DevTools:
- Check classesSlice state
- Verify filter state shows 'recruiting'
```

---

## Test 3: Load Classes List

**Steps:**

1. Wait for page to load
2. Observe class cards

**Expected Result:**

- ✅ Loading spinner shows briefly
- ✅ Classes load and display in cards
- ✅ Each class card shows:
  - Subject name (e.g., "Toán Học")
  - Description
  - Status badge (blue for recruiting)
  - Summary info: Giá/Giờ, Lịch, Ứng, Gia Sư

**Debug:**

```
Network Tab:
- Request: GET /api/student/class
- Response status: 200
- Response body should have data array with ClassItem objects

Expected fields in response:
- class_id, subject_id, subject_name, description
- hourly_price, schedule_count, status
- tutor_id, tutor_name, tutor_email, tutor_phone
- tutor_rating, tutor_reviews, tutor_description
```

---

## Test 4: Expand/Collapse Class Card

**Steps:**

1. Click on a class card (anywhere on card body)
2. Card should expand
3. Click again to collapse

**Expected Result:**

- ✅ First click: Card expands, ChevronUp icon shows, tutor details appear
- ✅ Second click: Card collapses, ChevronDown icon shows, tutor details hidden
- ✅ Only one card expanded at a time (previous expands close)

**Debug:**

```
React DevTools:
- Check expandedClassId state in ManageClassesPage
- Verify toggleExpand function is called on click
```

---

## Test 5A: Display Tutor Details (When Tutor Assigned)

**Steps:**

1. Click on a class that has tutor_id !== null
2. Observe expanded content

**Expected Result - Tutor Card Shows:**

- ✅ "📋 Thông Tin Gia Sư" heading
- ✅ Tutor name (e.g., "Nguyễn Văn A")
- ✅ 📧 Email (clickable, opens mailto)
- ✅ 📞 Phone (clickable, opens tel)
- ✅ ⭐ Rating with count (e.g., "4.8 / 5.0 (42 đánh giá)")
- ✅ Tutor description (max 3 lines, truncated)
- ✅ "Xem Chi Tiết" button
- ✅ "Mời Gia Sư" button (if status = 'recruiting')

**Debug:**

```
Inspect Element:
- Check if tutor fields have correct data from backend
- Verify email link: href="mailto:..."
- Verify phone link: href="tel:..."
- Check description text content
```

---

## Test 5B: Display "Chưa Có Gia Sư" Message (When No Tutor)

**Steps:**

1. Click on a class that has tutor_id = null
2. Observe expanded content

**Expected Result:**

- ✅ "ℹ️ Chưa có gia sư - Hãy mời hoặc chờ gia sư ứng tuyển" message appears
- ✅ Blue info box with message
- ✅ "Xem Chi Tiết" button visible
- ✅ "Mời Gia Sư" button visible

**Debug:**

```
Check backend response:
- Verify tutor_id is NULL/undefined in response
- All tutor_* fields should be NULL
```

---

## Test 6: Filter by Status

**Steps:**

1. Click "Có Gia Sư" filter button
2. Observe class list changes
3. Click "Đang Học" filter
4. Observe class list changes
5. Click "Tất Cả" filter
6. Observe all classes show

**Expected Result:**

- ✅ Each filter shows only classes with that status
- ✅ "Tất Cả" shows classes with all statuses
- ✅ Button highlights show selected filter

**Debug:**

```
API Requests:
- Each filter should send request: GET /api/student/class?status=X
- Or no ?status param for "Tất Cả"

Redux:
- Check filter state changes in Redux DevTools
```

---

## Test 7: Empty State

**Steps:**

1. Apply filter that returns no classes (e.g., if no 'active' classes exist)
2. Observe page

**Expected Result:**

- ✅ "Không có lớp học nào" message displays
- ✅ "Tạo Lớp Mới" button is visible below message
- ✅ No error messages

---

## Test 8: Navigate to Class Detail

**Steps:**

1. Expand a class card
2. Click "Xem Chi Tiết" button
3. Observe navigation

**Expected Result:**

- ✅ Navigate to `/student/classes/:class_id`
- ✅ Class detail page loads (if implemented)
- ✅ URL shows correct class_id in path

---

## Test 9: Invite Tutor (if status = recruiting)

**Steps:**

1. Expand a class with status = 'recruiting'
2. Click "Mời Gia Sư" button
3. Observe behavior

**Expected Result:**

- ✅ Button may navigate to tutor selection page or open modal
- ✅ No errors in console

---

## Test 10: Create New Class

**Steps:**

1. Click "Tạo Lớp Mới" button from ManageClassesPage
2. Navigate to class creation

**Expected Result:**

- ✅ Navigate to `/student/create-class`
- ✅ CreateClassPage or ClassFormStep1 loads

---

## Test 11: Redux State Serialization

**Steps:**

1. Open Redux DevTools
2. Look at classesSlice state
3. Check selectedTutors field

**Expected Result:**

- ✅ NO errors about "non-serializable value in Redux store"
- ✅ selectedTutors is a string array: ["123", "456"]
- ✅ NOT a Set: {123, 456}

**Debug:**

```
Redux DevTools:
- Navigate to Diff tab
- Look for selectedTutors
- Should see: selectedTutors: string[]
- NOT: selectedTutors: Set(...)
```

---

## Test 12: Responsive Design

**Steps:**

1. Open page on desktop (1920px)
2. Check layout looks good
3. Resize to tablet (768px)
4. Resize to mobile (375px)

**Expected Result:**

- ✅ Desktop: 4-column grid in summary
- ✅ Tablet: 2-column grid
- ✅ Mobile: 1-column layout
- ✅ All text readable
- ✅ Buttons still clickable

---

## Test 13: Error Handling

**Steps:**

1. Disconnect internet or block API
2. Reload page
3. Try to filter classes

**Expected Result:**

- ✅ Error message displays
- ✅ No blank page or frozen UI
- ✅ Can retry or navigate back

---

## API Data Validation

**When viewing a class card, verify response structure:**

```json
{
  "success": true,
  "message": "Danh sách lớp học của học viên",
  "data": [
    {
      "class_id": "class_001",
      "subject_id": "subj_1",
      "subject_name": "Toán Học",
      "description": "Tìm gia sư dạy toán cấp 2",
      "requirement": "Có kinh nghiệm",
      "hourly_price": 200000,
      "schedule_count": 2,
      "status": "recruiting",

      // IMPORTANT: Tutor fields should be NULL if no tutor assigned
      "tutor_id": "tutor_123", // or null
      "tutor_name": "Nguyễn Văn A", // or null
      "tutor_email": "nguyena@example.com", // or null
      "tutor_phone": "0912345678", // or null
      "tutor_rating": 4.8, // or null
      "tutor_reviews": 42, // or null
      "tutor_description": "...", // or null

      "invited_tutors_count": 2,
      "applied_tutors_count": 1
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue: Classes not loading

**Solution:**

- Check token in localStorage
- Verify backend is running
- Check network tab for 401/403/500 errors
- Check backend logs for SQL errors

### Issue: Tutor details don't show

**Solution:**

- Check if tutor_id is NULL in database
- Verify LEFT JOIN working in backend SQL
- Check network response has tutor\_\* fields
- Check for NULL vs undefined in frontend

### Issue: Expand/collapse not working

**Solution:**

- Check expandedClassId state updates
- Verify onClick handler attached to card
- Check for CSS conflicts hiding content
- Check console for React errors

### Issue: Tutor email/phone links don't work

**Solution:**

- Check href attributes: "mailto:..." and "tel:..."
- Verify email/phone data in database
- Browser may need to handle custom protocols

### Issue: Filter buttons not responding

**Solution:**

- Check Redux filter state updates
- Verify API request sent with ?status param
- Check network tab for 400/500 errors
- Clear browser cache and reload

---

## Performance Checks

- [ ] Initial load time < 2 seconds
- [ ] Filter switching < 500ms
- [ ] Expand/collapse animation smooth (60fps)
- [ ] No unnecessary re-renders (check React DevTools Profiler)
- [ ] No memory leaks (check Chrome Task Manager)

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Accessibility Checks

- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Screen reader announces class info correctly
- [ ] Color contrast meets WCAG AA standard
- [ ] Focus indicators visible
- [ ] Links have descriptive text

---

## Sign-Off

**Tested By:** ******\_\_\_\_******  
**Date:** ******\_\_\_\_******  
**All Tests Passed:** ☐ Yes ☐ No  
**Issues Found:** ******\_\_\_\_******

-- =====================================================
-- TUTOR SUPPORT SYSTEM - COMMON SQL QUERIES
-- =====================================================

-- =====================================================
-- USER MANAGEMENT QUERIES
-- =====================================================

-- 1. Đăng ký người dùng mới (học viên)
INSERT INTO User (email, password, fullName, age, address_id, role, phone, locationDetail) 
VALUES ('newstudent@example.com', '$2a$10$hashedpassword', 'Nguyễn Văn Nam', 16, 1, 'student', '0901111111', 'Địa chỉ cụ thể');

INSERT INTO Student (gradeLevel, school, user_id) 
VALUES (11, 'THPT ABC', LAST_INSERT_ID());

-- 2. Đăng ký gia sư mới
INSERT INTO User (email, password, fullName, age, address_id, role, phone, locationDetail) 
VALUES ('newtutor@example.com', '$2a$10$hashedpassword', 'Phạm Thị Mai', 26, 2, 'tutor', '0902222222', 'Địa chỉ gia sư');

INSERT INTO Tutor (introduction, experienceYears, teachingStyle, specialties, verified, user_id) 
VALUES ('Kinh nghiệm 3 năm dạy học', 3, 'Tương tác nhiều', 'Toán, Lý', FALSE, LAST_INSERT_ID());

-- 3. Đăng nhập - kiểm tra thông tin người dùng
SELECT u.*, s.gradeLevel, s.school 
FROM User u 
LEFT JOIN Student s ON u.id = s.user_id 
WHERE u.email = 'user@example.com' AND u.password = '$2a$10$hashedpassword';

-- 4. Lấy thông tin gia sư với địa chỉ
SELECT 
    t.id as tutor_id,
    u.fullName,
    u.email,
    u.phone,
    u.age,
    t.introduction,
    t.experienceYears,
    t.specialties,
    t.verified,
    w.name as ward_name,
    p.name as province_name
FROM Tutor t
JOIN User u ON t.user_id = u.id
LEFT JOIN Ward w ON u.address_id = w.id  
LEFT JOIN Province_Id p ON w.province_id = p.id
WHERE t.verified = TRUE;

-- =====================================================
-- CLASS AND SUBJECT QUERIES  
-- =====================================================

-- 5. Tạo lớp học mới
INSERT INTO Class (student_id, tutor_id, subject_id)
VALUES (1, 1, 1);

-- 6. Lấy danh sách lớp học của học viên
SELECT 
    c.id as class_id,
    u_tutor.fullName as tutor_name,
    sub.name as subject_name,
    sub.educationLevel,
    c.created_at
FROM Class c
JOIN Tutor t ON c.tutor_id = t.id
JOIN User u_tutor ON t.user_id = u_tutor.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.student_id = 1;

-- 7. Lấy danh sách lớp học của gia sư
SELECT 
    c.id as class_id,
    u_student.fullName as student_name,
    sub.name as subject_name,
    s.gradeLevel,
    s.school,
    c.created_at
FROM Class c
JOIN Student st ON c.student_id = st.id
JOIN User u_student ON st.user_id = u_student.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.tutor_id = 1;

-- 8. Tìm kiếm gia sư theo môn học và địa điểm
SELECT DISTINCT
    t.id as tutor_id,
    u.fullName,
    u.phone,
    t.introduction,
    t.experienceYears,
    t.specialties,
    w.name as ward_name,
    p.name as province_name
FROM Tutor t
JOIN User u ON t.user_id = u.id
LEFT JOIN Ward w ON u.address_id = w.id
LEFT JOIN Province_Id p ON w.province_id = p.id
WHERE t.verified = TRUE 
  AND t.specialties LIKE '%Toán%'
  AND p.id = 1; -- Hồ Chí Minh

-- =====================================================
-- SCHEDULE QUERIES
-- =====================================================

-- 9. Tạo lịch học mới
INSERT INTO Schedule (class_id, start, end) 
VALUES (1, '2025-10-16 14:00:00', '2025-10-16 16:00:00');

-- 10. Lấy lịch học của học viên trong tuần
SELECT 
    s.id as schedule_id,
    s.start,
    s.end,
    u_tutor.fullName as tutor_name,
    sub.name as subject_name,
    u_tutor.phone as tutor_phone
FROM Schedule s
JOIN Class c ON s.class_id = c.id
JOIN Tutor t ON c.tutor_id = t.id
JOIN User u_tutor ON t.user_id = u_tutor.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.student_id = 1
  AND s.start BETWEEN '2025-10-15 00:00:00' AND '2025-10-21 23:59:59'
ORDER BY s.start;

-- 11. Lấy lịch học của gia sư trong ngày
SELECT 
    s.id as schedule_id,
    s.start,
    s.end,
    u_student.fullName as student_name,
    sub.name as subject_name,
    u_student.phone as student_phone
FROM Schedule s
JOIN Class c ON s.class_id = c.id
JOIN Student st ON c.student_id = st.id
JOIN User u_student ON st.user_id = u_student.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.tutor_id = 1
  AND DATE(s.start) = '2025-10-16'
ORDER BY s.start;

-- =====================================================
-- APPLICATION QUERIES
-- =====================================================

-- 12. Gia sư ứng tuyển vào lớp học
INSERT INTO Applications (tutor_id, class_id, status)
VALUES (1, 2, 'pending');

-- 13. Lấy danh sách đơn ứng tuyển của gia sư
SELECT 
    a.id as application_id,
    a.created_at,
    a.status,
    u_student.fullName as student_name,
    sub.name as subject_name,
    s.gradeLevel
FROM Applications a
JOIN Class c ON a.class_id = c.id
JOIN Student st ON c.student_id = st.id
JOIN User u_student ON st.user_id = u_student.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE a.tutor_id = 1
ORDER BY a.created_at DESC;

-- 14. Duyệt đơn ứng tuyển
UPDATE Applications 
SET status = 'approved' 
WHERE id = 1;

-- 15. Từ chối đơn ứng tuyển
UPDATE Applications 
SET status = 'rejected' 
WHERE id = 1;

-- =====================================================
-- ASSIGNMENT QUERIES
-- =====================================================

-- 16. Tạo bài tập mới
INSERT INTO Assignments (class_id, subject_id, title, description, start, end)
VALUES (1, 1, 'Bài tập Đại số', 'Giải các phương trình bậc 2', '2025-10-16 00:00:00', '2025-10-20 23:59:59');

-- 17. Lấy danh sách bài tập của lớp
SELECT 
    a.id as assignment_id,
    a.title,
    a.description,
    a.start,
    a.end,
    sub.name as subject_name
FROM Assignments a
JOIN Subject sub ON a.subject_id = sub.id
WHERE a.class_id = 1
ORDER BY a.start DESC;

-- 18. Lấy bài tập sắp hết hạn của học viên
SELECT 
    a.id as assignment_id,
    a.title,
    a.description,
    a.end as deadline,
    sub.name as subject_name,
    u_tutor.fullName as tutor_name
FROM Assignments a
JOIN Class c ON a.class_id = c.id
JOIN Subject sub ON a.subject_id = sub.id
JOIN Tutor t ON c.tutor_id = t.id
JOIN User u_tutor ON t.user_id = u_tutor.id
WHERE c.student_id = 1
  AND a.end > NOW()
  AND a.end <= DATE_ADD(NOW(), INTERVAL 3 DAY)
ORDER BY a.end;

-- =====================================================
-- DOCUMENT QUERIES
-- =====================================================

-- 19. Upload tài liệu học tập
INSERT INTO StudyDocuments (class_id, subject_id, name, file_path, file_size, desc)
VALUES (1, 1, 'Công thức toán học.pdf', '/uploads/documents/formula_math.pdf', 1024000, 'Tổng hợp công thức toán học cơ bản');

-- 20. Lấy danh sách tài liệu của lớp
SELECT 
    sd.id as document_id,
    sd.name,
    sd.desc,
    sd.file_path,
    sd.file_size,
    sd.created_at,
    sub.name as subject_name
FROM StudyDocuments sd
JOIN Subject sub ON sd.subject_id = sub.id
WHERE sd.class_id = 1
ORDER BY sd.created_at DESC;

-- =====================================================
-- FAVORITE TUTOR QUERIES
-- =====================================================

-- 21. Thêm gia sư vào danh sách yêu thích
INSERT INTO FavouriteTutor (student_id, tutor_id)
VALUES (1, 2)
ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;

-- 22. Lấy danh sách gia sư yêu thích
SELECT 
    ft.created_at as favorited_at,
    u.fullName as tutor_name,
    t.introduction,
    t.specialties,
    t.experienceYears,
    u.phone
FROM FavouriteTutor ft
JOIN Tutor t ON ft.tutor_id = t.id
JOIN User u ON t.user_id = u.id
WHERE ft.student_id = 1
ORDER BY ft.created_at DESC;

-- 23. Xóa gia sư khỏi danh sách yêu thích
DELETE FROM FavouriteTutor 
WHERE student_id = 1 AND tutor_id = 2;

-- =====================================================
-- CONVERSATION QUERIES
-- =====================================================

-- 24. Tạo cuộc hội thoại mới
INSERT INTO ConversationsMetaData (person1_id, person2_id)
VALUES (1, 3)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 25. Lấy danh sách cuộc hội thoại của user
SELECT 
    cmd.id as conversation_id,
    CASE 
        WHEN cmd.person1_id = 1 THEN u2.fullName
        ELSE u1.fullName
    END as contact_name,
    CASE 
        WHEN cmd.person1_id = 1 THEN u2.id
        ELSE u1.id
    END as contact_id,
    cmd.updated_at as last_activity
FROM ConversationsMetaData cmd
JOIN User u1 ON cmd.person1_id = u1.id
JOIN User u2 ON cmd.person2_id = u2.id
WHERE cmd.person1_id = 1 OR cmd.person2_id = 1
ORDER BY cmd.updated_at DESC;

-- =====================================================
-- STATISTICS QUERIES
-- =====================================================

-- 26. Thống kê số lượng học viên theo tỉnh thành
SELECT 
    p.name as province_name,
    COUNT(DISTINCT s.id) as student_count
FROM Province_Id p
LEFT JOIN Ward w ON p.id = w.province_id
LEFT JOIN User u ON w.id = u.address_id
LEFT JOIN Student s ON u.id = s.user_id
WHERE u.role = 'student'
GROUP BY p.id, p.name
ORDER BY student_count DESC;

-- 27. Thống kê gia sư theo chuyên môn
SELECT 
    specialties,
    COUNT(*) as tutor_count,
    AVG(experienceYears) as avg_experience
FROM Tutor 
WHERE verified = TRUE
GROUP BY specialties
ORDER BY tutor_count DESC;

-- 28. Thống kê lớp học theo môn học
SELECT 
    sub.name as subject_name,
    sub.educationLevel,
    COUNT(c.id) as class_count
FROM Subject sub
LEFT JOIN Class c ON sub.id = c.subject_id
GROUP BY sub.id, sub.name, sub.educationLevel
ORDER BY class_count DESC;

-- 29. Lấy top gia sư được yêu thích nhất
SELECT 
    u.fullName as tutor_name,
    t.specialties,
    COUNT(ft.id) as favorite_count,
    t.experienceYears
FROM Tutor t
JOIN User u ON t.user_id = u.id
LEFT JOIN FavouriteTutor ft ON t.id = ft.tutor_id
WHERE t.verified = TRUE
GROUP BY t.id, u.fullName, t.specialties, t.experienceYears
ORDER BY favorite_count DESC, t.experienceYears DESC
LIMIT 10;

-- 30. Thống kê hoạt động theo tháng
SELECT 
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    COUNT(*) as new_classes
FROM Class
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;
-- =====================================================
-- INSERT SAMPLE DATA FOR CLASS TABLE
-- =====================================================
-- This script inserts sample class data with various statuses
-- to test the tutor application and workflow

USE tutor_support_system;
GO

-- =====================================================
-- INSERT CLASS DATA (Lớp học)
-- =====================================================

-- Class 1: Recruiting - Học sinh 1 tìm gia sư Toán
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 1, 'recruiting', 0);

-- Class 2: Recruiting - Học sinh 1 tìm gia sư Tiếng Anh
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 4, 'recruiting', 0);

-- Class 3: Has tutor (assigned) - Học sinh 2 với gia sư 1 (Toán)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 1, 1, 'has_tutor', 0);

-- Class 4: Has tutor (locked, waiting for tutor response) - Học sinh 2 với gia sư 2 (Tiếng Anh)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 2, 4, 'has_tutor', 0);

-- Class 5: In progress - Học sinh 1 với gia sư 1 (Vật lý)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, 1, 2, 'in_progress', 0);

-- Class 6: Completed - Học sinh 2 với gia sư 1 (Hóa học)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 1, 3, 'completed', 0);

-- Class 7: Recruiting with lock (có lời mời đang chờ) - Học sinh 1 tìm gia sư Hóa học
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 3, 'recruiting', 1);

-- Class 8: Recruiting - Học sinh 2 tìm gia sư Văn học
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, NULL, 5, 'recruiting', 0);

-- Class 9: Cancelled - Học sinh 1 hủy lớp học Văn học
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 5, 'cancelled', 0);

-- Class 10: In progress - Học sinh 1 với gia sư 2 (Hóa học)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, 2, 3, 'in_progress', 0);

-- Class 11: Has tutor - Học sinh 2 với gia sư 2 (Vật lý)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 2, 2, 'has_tutor', 0);

-- Class 12: Recruiting - Học sinh 1 tìm gia sư Vật lý
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 2, 'recruiting', 0);

-- Class 13: Recruiting (locked) - Học sinh 2 tìm gia sư Toán (có lời mời)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, NULL, 1, 'recruiting', 1);

-- Class 14: Completed - Học sinh 1 với gia sư 2 (Tiếng Anh)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, 2, 4, 'completed', 0);

-- Class 15: In progress - Học sinh 2 với gia sư 1 (Văn học)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 1, 5, 'in_progress', 0);

-- Class 16: Recruiting - Học sinh 1 tìm gia sư Toán (thêm 1 lần nữa)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 1, 'recruiting', 0);

-- Class 17: Has tutor - Học sinh 1 với gia sư 1 (Toán - lần thứ 2)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, 1, 1, 'has_tutor', 0);

-- Class 18: Completed - Học sinh 2 với gia sư 2 (Văn học)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 2, 5, 'completed', 0);

-- Class 19: Recruiting - Học sinh 2 tìm gia sư Vật lý
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, NULL, 2, 'recruiting', 0);

-- Class 20: Cancelled - Học sinh 1 hủy lớp học Vật lý
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 2, 'cancelled', 0);

-- Class 21: In progress - Học sinh 2 với gia sư 1 (Hóa học - lần 2)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, 1, 3, 'in_progress', 0);

-- Class 22: Recruiting (locked) - Học sinh 1 tìm gia sư Tiếng Anh (có lời mời)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, NULL, 4, 'recruiting', 1);

-- Class 23: Has tutor - Học sinh 1 với gia sư 2 (Vật lý - lần 2)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, 2, 2, 'has_tutor', 0);

-- Class 24: Completed - Học sinh 1 với gia sư 1 (Hóa học - lần 2)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (1, 1, 3, 'completed', 0);

-- Class 25: Recruiting - Học sinh 2 tìm gia sư Tiếng Anh (lần 2)
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked)
VALUES (2, NULL, 4, 'recruiting', 0);

PRINT N'✅ Đã chèn 25 lớp học mẫu thành công';

-- =====================================================
-- VERIFY INSERTED DATA
-- =====================================================

SELECT N'=== CLASS DATA ===' as [Status];
SELECT 
    c.id,
    s.fullName as student_name,
    CASE WHEN c.tutor_id IS NOT NULL THEN t.fullName ELSE N'Chưa có' END as tutor_name,
    sub.name as subject_name,
    c.status,
    c.isLocked,
    c.created_at
FROM Class c
JOIN Student st ON c.student_id = st.id
JOIN [User] s ON st.user_id = s.id
LEFT JOIN Tutor tu ON c.tutor_id = tu.id
LEFT JOIN [User] t ON tu.user_id = t.id
JOIN Subject sub ON c.subject_id = sub.id
ORDER BY c.id;

-- =====================================================
-- CREATE APPLICATIONS SAMPLE DATA
-- =====================================================

-- Ứng tuyển 1: Gia sư 1 ứng tuyển lớp 1 (Toán)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 1, 'applied', NULL);

-- Ứng tuyển 2: Gia sư 2 ứng tuyển lớp 1 (Toán)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 1, 'applied', NULL);

-- Ứng tuyển 3: Gia sư 1 ứng tuyển lớp 2 (Tiếng Anh) - bị từ chối
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 2, 'rejected', NULL);

-- Ứng tuyển 4: Gia sư 2 ứng tuyển lớp 2 (Tiếng Anh) - đã được duyệt
INSERT INTO Applications (tutor_id, class_id, status, approved_at, response_at, isConfirmed)
VALUES (2, 2, 'approved', GETDATE(), GETDATE(), 1);

-- Ứng tuyển 5: Gia sư 1 ứng tuyển lớp 7 (Hóa học) - đã được mời
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 7, 'approved', GETDATE());

-- Ứng tuyển 6: Gia sư 2 ứng tuyển lớp 7 (Hóa học) - chưa phản hồi
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 7, 'approved', GETDATE());

-- Ứng tuyển 7: Gia sư 1 rút đơn (ứng tuyển lớp 2 - Tiếng Anh)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 2, 'withdrawn', NULL);

-- Ứng tuyển 8: Gia sư 1 ứng tuyển lớp 8 (Văn học)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 8, 'applied', NULL);

-- Ứng tuyển 9: Gia sư 2 ứng tuyển lớp 8 (Văn học)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 8, 'applied', NULL);

-- Ứng tuyển 10: Gia sư 1 ứng tuyển lớp 12 (Vật lý)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 12, 'applied', NULL);

-- Ứng tuyển 11: Gia sư 2 ứng tuyển lớp 12 (Vật lý) - được duyệt
INSERT INTO Applications (tutor_id, class_id, status, approved_at, response_at, isConfirmed)
VALUES (2, 12, 'approved', GETDATE(), GETDATE(), 1);

-- Ứng tuyển 12: Gia sư 1 ứng tuyển lớp 13 (Toán) - đã mời
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 13, 'approved', GETDATE());

-- Ứng tuyển 13: Gia sư 2 ứng tuyển lớp 13 (Toán) - chưa phản hồi
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 13, 'approved', GETDATE());

-- Ứng tuyển 14: Gia sư 1 ứng tuyển lớp 16 (Toán)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 16, 'applied', NULL);

-- Ứng tuyển 15: Gia sư 2 ứng tuyển lớp 16 (Toán) - bị từ chối
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 16, 'rejected', NULL);

-- Ứng tuyển 16: Gia sư 1 ứng tuyển lớp 19 (Vật lý)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 19, 'applied', NULL);

-- Ứng tuyển 17: Gia sư 2 ứng tuyển lớp 19 (Vật lý)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 19, 'applied', NULL);

-- Ứng tuyển 18: Gia sư 1 ứng tuyển lớp 22 (Tiếng Anh) - đã mời
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 22, 'approved', GETDATE());

-- Ứng tuyển 19: Gia sư 2 ứng tuyển lớp 22 (Tiếng Anh) - chưa phản hồi
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (2, 22, 'approved', GETDATE());

-- Ứng tuyển 20: Gia sư 1 ứng tuyển lớp 25 (Tiếng Anh)
INSERT INTO Applications (tutor_id, class_id, status, approved_at)
VALUES (1, 25, 'applied', NULL);

-- Ứng tuyển 21: Gia sư 2 ứng tuyển lớp 25 (Tiếng Anh) - được duyệt
INSERT INTO Applications (tutor_id, class_id, status, approved_at, response_at, isConfirmed)
VALUES (2, 25, 'approved', GETDATE(), GETDATE(), 1);

PRINT N'✅ Đã chèn 21 ứng tuyển mẫu thành công';

-- =====================================================
-- VERIFY APPLICATIONS DATA
-- =====================================================

SELECT N'=== APPLICATIONS DATA ===' as [Status];
SELECT 
    a.id,
    t.fullName as tutor_name,
    c.id as class_id,
    sub.name as subject_name,
    s.fullName as student_name,
    a.status,
    a.approved_at,
    a.response_at,
    CASE 
        WHEN a.isConfirmed IS NULL THEN N'Chưa phản hồi'
        WHEN a.isConfirmed = 1 THEN N'Xác nhận'
        ELSE N'Từ chối'
    END as tutor_response
FROM Applications a
JOIN Tutor tu ON a.tutor_id = tu.id
JOIN [User] t ON tu.user_id = t.id
JOIN Class c ON a.class_id = c.id
JOIN Student st ON c.student_id = st.id
JOIN [User] s ON st.user_id = s.id
JOIN Subject sub ON c.subject_id = sub.id
ORDER BY a.id;

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================

SELECT N'=== STATISTICS ===' as [Status];

SELECT N'Tổng lớp học:' as metric, COUNT(*) as count FROM Class;
SELECT N'Lớp đang tuyển:' as metric, COUNT(*) as count FROM Class WHERE status = 'recruiting';
SELECT N'Lớp có gia sư:' as metric, COUNT(*) as count FROM Class WHERE status = 'has_tutor';
SELECT N'Lớp đang dạy:' as metric, COUNT(*) as count FROM Class WHERE status = 'in_progress';
SELECT N'Lớp hoàn thành:' as metric, COUNT(*) as count FROM Class WHERE status = 'completed';
SELECT N'Lớp đã hủy:' as metric, COUNT(*) as count FROM Class WHERE status = 'cancelled';

SELECT N'=== END ===' as [Status];

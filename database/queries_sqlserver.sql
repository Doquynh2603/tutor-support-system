-- =====================================================
-- TUTOR SUPPORT SYSTEM - COMMON SQL QUERIES (SQL SERVER)
-- =====================================================

-- =====================================================
-- USER MANAGEMENT QUERIES
-- =====================================================

-- 1. Đăng ký người dùng mới (học viên)
DECLARE @NewUserId BIGINT;

INSERT INTO [User] (email, password, fullName, age, address_id, role, phone, locationDetail) 
VALUES ('newstudent@example.com', '$2a$10$hashedpassword', N'Nguyễn Văn Nam', 16, 1, 'student', '0901111111', N'Địa chỉ cụ thể');

SET @NewUserId = SCOPE_IDENTITY();

INSERT INTO Student (gradeLevel, school, user_id) 
VALUES (11, N'THPT ABC', @NewUserId);

-- 2. Đăng ký gia sư mới
DECLARE @NewTutorUserId BIGINT;

INSERT INTO [User] (email, password, fullName, age, address_id, role, phone, locationDetail) 
VALUES ('newtutor@example.com', '$2a$10$hashedpassword', N'Phạm Thị Mai', 26, 2, 'tutor', '0902222222', N'Địa chỉ gia sư');

SET @NewTutorUserId = SCOPE_IDENTITY();

INSERT INTO Tutor (introduction, experienceYears, teachingStyle, specialties, verified, user_id) 
VALUES (N'Kinh nghiệm 3 năm dạy học', 3, N'Tương tác nhiều', N'Toán, Lý', 0, @NewTutorUserId);

-- 3. Đăng nhập - kiểm tra thông tin người dùng
SELECT u.*, s.gradeLevel, s.school 
FROM [User] u 
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
JOIN [User] u ON t.user_id = u.id
LEFT JOIN Ward w ON u.address_id = w.id  
LEFT JOIN Province_Id p ON w.province_id = p.id
WHERE t.verified = 1;

-- =====================================================
-- CLASS AND SUBJECT QUERIES  
-- =====================================================

-- 5. Tạo lớp học mới (đang tuyển gia sư)
INSERT INTO Class (student_id, subject_id, status, isLocked)
VALUES (1, 1, 'recruiting', 0);

-- 6. Lấy danh sách lớp học của học viên
SELECT 
    c.id as class_id,
    CASE WHEN c.tutor_id IS NOT NULL THEN u_tutor.fullName ELSE N'Chưa có gia sư' END as tutor_name,
    sub.name as subject_name,
    sub.educationLevel,
    c.status as class_status,
    c.isLocked,
    c.created_at
FROM Class c
LEFT JOIN Tutor t ON c.tutor_id = t.id
LEFT JOIN [User] u_tutor ON t.user_id = u_tutor.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.student_id = 1;

-- 7. Lấy danh sách lớp học của gia sư
SELECT 
    c.id as class_id,
    u_student.fullName as student_name,
    sub.name as subject_name,
    s.gradeLevel,
    s.school,
    c.status as class_status,
    c.isLocked,
    c.created_at
FROM Class c
JOIN Student st ON c.student_id = st.id
JOIN [User] u_student ON st.user_id = u_student.id
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
JOIN [User] u ON t.user_id = u.id
LEFT JOIN Ward w ON u.address_id = w.id
LEFT JOIN Province_Id p ON w.province_id = p.id
WHERE t.verified = 1 
  AND t.specialties LIKE N'%Toán%'
  AND p.id = 1; -- Hồ Chí Minh

-- =====================================================
-- SCHEDULE QUERIES
-- =====================================================

-- 9. Tạo lịch học mới
INSERT INTO Schedule (class_id, start, [end]) 
VALUES (1, '2025-10-16 14:00:00', '2025-10-16 16:00:00');

-- 10. Lấy lịch học của học viên trong tuần
SELECT 
    s.id as schedule_id,
    s.start,
    s.[end],
    u_tutor.fullName as tutor_name,
    sub.name as subject_name,
    u_tutor.phone as tutor_phone
FROM Schedule s
JOIN Class c ON s.class_id = c.id
JOIN Tutor t ON c.tutor_id = t.id
JOIN [User] u_tutor ON t.user_id = u_tutor.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.student_id = 1
  AND s.start BETWEEN '2025-10-15 00:00:00' AND '2025-10-21 23:59:59'
ORDER BY s.start;

-- 11. Lấy lịch học của gia sư trong ngày
SELECT 
    s.id as schedule_id,
    s.start,
    s.[end],
    u_student.fullName as student_name,
    sub.name as subject_name,
    u_student.phone as student_phone
FROM Schedule s
JOIN Class c ON s.class_id = c.id
JOIN Student st ON c.student_id = st.id
JOIN [User] u_student ON st.user_id = u_student.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.tutor_id = 1
  AND CAST(s.start AS DATE) = '2025-10-16'
ORDER BY s.start;

-- =====================================================
-- APPLICATION QUERIES
-- =====================================================

-- 12. Gia sư ứng tuyển vào lớp học (luôn cho phép ứng tuyển nếu lớp đang recruiting)
IF EXISTS (
    SELECT 1 FROM Class 
    WHERE id = 2 AND status = 'recruiting'
)
BEGIN
    -- Kiểm tra gia sư đã ứng tuyển chưa
    IF NOT EXISTS (
        SELECT 1 FROM Applications 
        WHERE tutor_id = 1 AND class_id = 2 AND status IN ('applied', 'approved')
    )
    BEGIN
        INSERT INTO Applications (tutor_id, class_id, status)
        VALUES (1, 2, 'applied');
        PRINT N'Đã gửi đơn ứng tuyển thành công';
    END
    ELSE
    BEGIN
        PRINT N'Bạn đã ứng tuyển lớp học này rồi';
    END
END
ELSE
BEGIN
    PRINT N'Lớp học không ở trạng thái tuyển gia sư';
END

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
JOIN [User] u_student ON st.user_id = u_student.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE a.tutor_id = 1
ORDER BY a.created_at DESC;

-- 14. Phụ huynh duyệt đơn ứng tuyển (chỉ không cho duyệt thêm nếu đã có 1 đơn được duyệt)
DECLARE @ClassId BIGINT;
SELECT @ClassId = class_id FROM Applications WHERE id = 1;

-- Kiểm tra xem đã có gia sư nào được duyệt chưa
IF NOT EXISTS (
    SELECT 1 FROM Applications 
    WHERE class_id = @ClassId AND status = 'approved'
)
BEGIN
    -- Duyệt đơn và khóa tạm thời (không cho duyệt thêm)
    UPDATE Applications 
    SET status = 'approved', approved_at = GETDATE() 
    WHERE id = 1;
    
    -- Khóa lớp để không cho duyệt thêm gia sư khác
    UPDATE Class 
    SET isLocked = 1 
    WHERE id = @ClassId;
    
    PRINT N'Đã duyệt gia sư. Chờ phản hồi từ gia sư.';
END
ELSE
BEGIN
    PRINT N'Đã có gia sư được duyệt. Vui lòng chờ phản hồi.';
END

-- 15. Từ chối đơn ứng tuyển
UPDATE Applications 
SET status = 'rejected' 
WHERE id = 1;

-- =====================================================
-- CLASS STATUS MANAGEMENT QUERIES
-- =====================================================

-- 15A. Gia sư xác nhận lời mời dạy học
UPDATE Applications 
SET isConfirmed = 1, response_at = GETDATE() 
WHERE id = 1 AND status = 'approved';

-- 15B. Gia sư từ chối lời mời dạy học (có lý do)
UPDATE Applications 
SET isConfirmed = 0, response_at = GETDATE(), declineReason = N'Lịch học không phù hợp' 
WHERE id = 1 AND status = 'approved';

-- 15C. Gia sư rút đơn ứng tuyển
UPDATE Applications 
SET status = 'withdrawn' 
WHERE id = 1 AND status = 'applied';

-- 15D. Phụ huynh hủy lời mời
UPDATE Applications 
SET status = 'invitation_cancelled' 
WHERE id = 1 AND status = 'approved' AND isConfirmed IS NULL;

-- 16A. Bắt đầu học (chuyển từ 'has_tutor' sang 'in_progress')
UPDATE Class 
SET status = 'in_progress' 
WHERE id = 1 AND status = 'has_tutor';

-- 17A. Hoàn thành lớp học
UPDATE Class 
SET status = 'completed' 
WHERE id = 1 AND status = 'in_progress';

-- 18A. Hủy lớp học
UPDATE Class 
SET status = 'cancelled', tutor_id = NULL, isLocked = 0 
WHERE id = 1;

-- 19A. Mở khóa lớp học để tuyển gia sư mới (sau khi hủy hoặc gia sư rút lui)
UPDATE Class 
SET status = 'recruiting', tutor_id = NULL, isLocked = 0 
WHERE id = 1;

-- 20A. Lấy danh sách lớp học theo trạng thái
SELECT 
    c.id as class_id,
    u_student.fullName as student_name,
    CASE WHEN c.tutor_id IS NOT NULL THEN u_tutor.fullName ELSE N'Chưa có gia sư' END as tutor_name,
    sub.name as subject_name,
    c.status,
    c.isLocked,
    c.created_at
FROM Class c
JOIN Student st ON c.student_id = st.id
JOIN [User] u_student ON st.user_id = u_student.id
LEFT JOIN Tutor t ON c.tutor_id = t.id
LEFT JOIN [User] u_tutor ON t.user_id = u_tutor.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE c.status = 'recruiting' -- Chỉ lấy lớp đang tuyển gia sư
ORDER BY c.created_at DESC;

-- 21A. Kiểm tra trạng thái lớp học và đơn ứng tuyển
SELECT 
    c.id,
    c.status,
    c.isLocked,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_applications,
    CASE 
        WHEN c.status = 'recruiting' THEN N'Có thể ứng tuyển'
        WHEN c.status != 'recruiting' THEN N'Lớp không ở trạng thái tuyển gia sư'
        ELSE N'Không thể ứng tuyển'
    END as can_apply_status,
    CASE 
        WHEN c.isLocked = 1 THEN N'Có gia sư được duyệt, chờ phản hồi. Không thể duyệt thêm.'
        ELSE N'Có thể duyệt đơn ứng tuyển'
    END as can_approve_status
FROM Class c
LEFT JOIN Applications a ON c.id = a.class_id
WHERE c.id = 1
GROUP BY c.id, c.status, c.isLocked;

-- =====================================================
-- ASSIGNMENT QUERIES
-- =====================================================

-- 16. Tạo bài tập mới
INSERT INTO Assignments (class_id, subject_id, title, [description], start, [end])
VALUES (1, 1, N'Bài tập Đại số', N'Giải các phương trình bậc 2', '2025-10-16 00:00:00', '2025-10-20 23:59:59');

-- 17. Lấy danh sách bài tập của lớp
SELECT 
    a.id as assignment_id,
    a.title,
    a.[description],
    a.start,
    a.[end],
    sub.name as subject_name
FROM Assignments a
JOIN Subject sub ON a.subject_id = sub.id
WHERE a.class_id = 1
ORDER BY a.start DESC;

-- 18. Lấy bài tập sắp hết hạn của học viên
SELECT 
    a.id as assignment_id,
    a.title,
    a.[description],
    a.[end] as deadline,
    sub.name as subject_name,
    u_tutor.fullName as tutor_name
FROM Assignments a
JOIN Class c ON a.class_id = c.id
JOIN Subject sub ON a.subject_id = sub.id
JOIN Tutor t ON c.tutor_id = t.id
JOIN [User] u_tutor ON t.user_id = u_tutor.id
WHERE c.student_id = 1
  AND a.[end] > GETDATE()
  AND a.[end] <= DATEADD(DAY, 3, GETDATE())
ORDER BY a.[end];

-- =====================================================
-- DOCUMENT QUERIES
-- =====================================================

-- 19. Upload tài liệu học tập
INSERT INTO StudyDocuments (class_id, subject_id, name, file_path, file_size, [desc])
VALUES (1, 1, N'Công thức toán học.pdf', '/uploads/documents/formula_math.pdf', 1024000, N'Tổng hợp công thức toán học cơ bản');

-- 20. Lấy danh sách tài liệu của lớp
SELECT 
    sd.id as document_id,
    sd.name,
    sd.[desc],
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
IF NOT EXISTS (SELECT 1 FROM FavouriteTutor WHERE student_id = 1 AND tutor_id = 2)
BEGIN
    INSERT INTO FavouriteTutor (student_id, tutor_id)
    VALUES (1, 2);
END
ELSE
BEGIN
    UPDATE FavouriteTutor 
    SET created_at = GETDATE()
    WHERE student_id = 1 AND tutor_id = 2;
END

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
JOIN [User] u ON t.user_id = u.id
WHERE ft.student_id = 1
ORDER BY ft.created_at DESC;

-- 23. Xóa gia sư khỏi danh sách yêu thích
DELETE FROM FavouriteTutor 
WHERE student_id = 1 AND tutor_id = 2;

-- =====================================================
-- CONVERSATION QUERIES
-- =====================================================

-- 24. Tạo cuộc hội thoại mới
IF NOT EXISTS (SELECT 1 FROM ConversationsMetaData WHERE (person1_id = 1 AND person2_id = 3) OR (person1_id = 3 AND person2_id = 1))
BEGIN
    INSERT INTO ConversationsMetaData (person1_id, person2_id)
    VALUES (1, 3);
END
ELSE
BEGIN
    UPDATE ConversationsMetaData 
    SET updated_at = GETDATE()
    WHERE (person1_id = 1 AND person2_id = 3) OR (person1_id = 3 AND person2_id = 1);
END

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
JOIN [User] u1 ON cmd.person1_id = u1.id
JOIN [User] u2 ON cmd.person2_id = u2.id
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
LEFT JOIN [User] u ON w.id = u.address_id
LEFT JOIN Student s ON u.id = s.user_id
WHERE u.role = 'student'
GROUP BY p.id, p.name
ORDER BY student_count DESC;

-- 27. Thống kê gia sư theo chuyên môn
SELECT 
    specialties,
    COUNT(*) as tutor_count,
    AVG(CAST(experienceYears AS FLOAT)) as avg_experience
FROM Tutor 
WHERE verified = 1
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
JOIN [User] u ON t.user_id = u.id
LEFT JOIN FavouriteTutor ft ON t.id = ft.tutor_id
WHERE t.verified = 1
GROUP BY t.id, u.fullName, t.specialties, t.experienceYears
ORDER BY favorite_count DESC, t.experienceYears DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;

-- 30. Thống kê hoạt động theo tháng
SELECT 
    YEAR(created_at) as year,
    MONTH(created_at) as month,
    COUNT(*) as new_classes
FROM Class
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;

-- =====================================================
-- ADVANCED QUERIES WITH COMMON TABLE EXPRESSIONS (CTE)
-- =====================================================

-- 31. Tìm gia sư có nhiều học viên nhất
WITH TutorStats AS (
    SELECT 
        t.id,
        u.fullName,
        COUNT(DISTINCT c.student_id) as student_count,
        COUNT(DISTINCT c.id) as class_count
    FROM Tutor t
    JOIN [User] u ON t.user_id = u.id
    LEFT JOIN Class c ON t.id = c.tutor_id
    WHERE t.verified = 1
    GROUP BY t.id, u.fullName
)
SELECT TOP 10 *
FROM TutorStats
ORDER BY student_count DESC, class_count DESC;

-- 32. Phân tích thời gian học của học viên
WITH StudentScheduleStats AS (
    SELECT 
        st.id as student_id,
        u.fullName as student_name,
        COUNT(s.id) as total_sessions,
        AVG(DATEDIFF(MINUTE, s.start, s.[end])) as avg_session_minutes,
        SUM(DATEDIFF(MINUTE, s.start, s.[end])) as total_minutes
    FROM Student st
    JOIN [User] u ON st.user_id = u.id
    JOIN Class c ON st.id = c.student_id
    JOIN Schedule s ON c.id = s.class_id
    WHERE s.start < GETDATE() -- Chỉ tính các buổi học đã diễn ra
    GROUP BY st.id, u.fullName
)
SELECT 
    *,
    total_minutes / 60.0 as total_hours
FROM StudentScheduleStats
ORDER BY total_minutes DESC;

-- 33. Stored Procedure: Tìm kiếm gia sư nâng cao
CREATE PROCEDURE sp_SearchTutors
    @SubjectName NVARCHAR(255) = NULL,
    @ProvinceId BIGINT = NULL,
    @MinExperience INT = 0,
    @MaxExperience INT = 50,
    @VerifiedOnly BIT = 1
AS
BEGIN
    SELECT 
        t.id as tutor_id,
        u.fullName,
        u.email,
        u.phone,
        t.introduction,
        t.experienceYears,
        t.specialties,
        w.name as ward_name,
        p.name as province_name,
        COUNT(ft.id) as favorite_count
    FROM Tutor t
    JOIN [User] u ON t.user_id = u.id
    LEFT JOIN Ward w ON u.address_id = w.id
    LEFT JOIN Province_Id p ON w.province_id = p.id
    LEFT JOIN FavouriteTutor ft ON t.id = ft.tutor_id
    WHERE 
        (@VerifiedOnly = 0 OR t.verified = 1)
        AND t.experienceYears >= @MinExperience
        AND t.experienceYears <= @MaxExperience
        AND (@SubjectName IS NULL OR t.specialties LIKE '%' + @SubjectName + '%')
        AND (@ProvinceId IS NULL OR p.id = @ProvinceId)
    GROUP BY 
        t.id, u.fullName, u.email, u.phone, t.introduction, 
        t.experienceYears, t.specialties, w.name, p.name
    ORDER BY favorite_count DESC, t.experienceYears DESC;
END;
GO

-- Sử dụng stored procedure:
-- EXEC sp_SearchTutors @SubjectName = N'Toán', @ProvinceId = 1, @MinExperience = 2;

-- 34. Function: Tính tổng giờ học của học viên
CREATE FUNCTION fn_GetStudentTotalHours(@StudentId BIGINT)
RETURNS FLOAT
AS
BEGIN
    DECLARE @TotalHours FLOAT;
    
    SELECT @TotalHours = ISNULL(SUM(DATEDIFF(MINUTE, s.start, s.[end])) / 60.0, 0)
    FROM Student st
    JOIN Class c ON st.id = c.student_id
    JOIN Schedule s ON c.id = s.class_id
    WHERE st.id = @StudentId AND s.start < GETDATE();
    
    RETURN @TotalHours;
END;
GO

-- Sử dụng function:
-- SELECT dbo.fn_GetStudentTotalHours(1) as TotalHours;

-- 35. Stored Procedure: Quản lý ứng tuyển và trạng thái lớp học
CREATE PROCEDURE sp_ManageApplicationAndClass
    @ClassId BIGINT = NULL,
    @ApplicationId BIGINT = NULL,
    @Action NVARCHAR(20), -- 'approve_application', 'tutor_accept', 'tutor_decline', 'start_class', 'complete_class', 'cancel_class'
    @TutorId BIGINT = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Phụ huynh duyệt đơn ứng tuyển
        IF @Action = 'approve_application'
        BEGIN
            DECLARE @AppClassId BIGINT;
            SELECT @AppClassId = class_id FROM Applications WHERE id = @ApplicationId;
            
            -- Kiểm tra xem đã có gia sư nào được duyệt chưa
            IF EXISTS (SELECT 1 FROM Applications WHERE class_id = @AppClassId AND status = 'approved')
            BEGIN
                RAISERROR(N'Đã có gia sư được duyệt. Vui lòng chờ phản hồi.', 16, 1);
                RETURN;
            END
            
            -- Duyệt đơn và khóa tạm thời
            UPDATE Applications 
            SET status = 'approved', approved_at = GETDATE() 
            WHERE id = @ApplicationId;
            
            UPDATE Class SET isLocked = 1 WHERE id = @AppClassId;
            PRINT N'Đã duyệt gia sư. Chờ phản hồi từ gia sư.';
        END
        
        -- Gia sư xác nhận
        ELSE IF @Action = 'tutor_confirm'
        BEGIN
            UPDATE Applications 
            SET isConfirmed = 1, response_at = GETDATE() 
            WHERE id = @ApplicationId AND status = 'approved';
            PRINT N'Gia sư đã xác nhận. Lớp học sẽ được cập nhật tự động.';
        END
        
        -- Gia sư từ chối (với lý do)
        ELSE IF @Action = 'tutor_decline'
        BEGIN
            DECLARE @DeclineReason NVARCHAR(500) = N'Lịch học không phù hợp'; -- Có thể tham số hóa
            UPDATE Applications 
            SET isConfirmed = 0, response_at = GETDATE(), declineReason = @DeclineReason 
            WHERE id = @ApplicationId AND status = 'approved';
            PRINT N'Gia sư đã từ chối. Phụ huynh có thể duyệt gia sư khác.';
        END
        
        -- Gia sư rút đơn
        ELSE IF @Action = 'withdraw_application'
        BEGIN
            UPDATE Applications 
            SET status = 'withdrawn' 
            WHERE id = @ApplicationId AND status = 'applied';
            PRINT N'Đã rút đơn ứng tuyển.';
        END
        
        -- Phụ huynh hủy lời mời
        ELSE IF @Action = 'cancel_invitation'
        BEGIN
            UPDATE Applications 
            SET status = 'invitation_cancelled' 
            WHERE id = @ApplicationId AND status = 'approved' AND isConfirmed IS NULL;
            
            -- Mở khóa lớp học
            DECLARE @CancelClassId BIGINT;
            SELECT @CancelClassId = class_id FROM Applications WHERE id = @ApplicationId;
            UPDATE Class SET isLocked = 0 WHERE id = @CancelClassId;
            
            PRINT N'Đã hủy lời mời gia sư.';
        END
        
        -- Bắt đầu học
        ELSE IF @Action = 'start_class'
        BEGIN
            DECLARE @CurrentStatus NVARCHAR(20);
            SELECT @CurrentStatus = status FROM Class WHERE id = @ClassId;
            
            IF @CurrentStatus != 'has_tutor'
            BEGIN
                RAISERROR(N'Lớp học chưa có gia sư được chấp nhận', 16, 1);
                RETURN;
            END
            
            UPDATE Class SET status = 'in_progress' WHERE id = @ClassId;
            PRINT N'Đã bắt đầu lớp học';
        END
        
        -- Hoàn thành lớp học
        ELSE IF @Action = 'complete_class'
        BEGIN
            UPDATE Class SET status = 'completed' WHERE id = @ClassId;
            PRINT N'Đã hoàn thành lớp học';
        END
        
        -- Hủy lớp học
        ELSE IF @Action = 'cancel_class'
        BEGIN
            UPDATE Class 
            SET status = 'cancelled', tutor_id = NULL, isLocked = 0 
            WHERE id = @ClassId;
            
            -- Từ chối tất cả đơn ứng tuyển
            UPDATE Applications 
            SET status = 'rejected' 
            WHERE class_id = @ClassId AND status IN ('pending', 'approved');
            
            PRINT N'Đã hủy lớp học';
        END
        
        ELSE
        BEGIN
            RAISERROR(N'Hành động không hợp lệ', 16, 1);
            RETURN;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Sử dụng stored procedure:
-- Phụ huynh duyệt gia sư:
-- EXEC sp_ManageApplicationAndClass @ApplicationId = 1, @Action = 'approve_application';

-- Gia sư chấp nhận:
-- EXEC sp_ManageApplicationAndClass @ApplicationId = 1, @Action = 'tutor_accept';

-- Gia sư từ chối:
-- EXEC sp_ManageApplicationAndClass @ApplicationId = 1, @Action = 'tutor_decline';

-- Bắt đầu học:
-- EXEC sp_ManageApplicationAndClass @ClassId = 1, @Action = 'start_class';

-- Hoàn thành:
-- EXEC sp_ManageApplicationAndClass @ClassId = 1, @Action = 'complete_class';

-- Hủy lớp:
-- EXEC sp_ManageApplicationAndClass @ClassId = 1, @Action = 'cancel_class';

-- =====================================================
-- WORKFLOW QUERIES - QUY TRÌNH HOÀN CHỈNH
-- =====================================================

-- 36. Xem chi tiết đơn ứng tuyển của một lớp học
SELECT 
    a.id as application_id,
    u.fullName as tutor_name,
    u.phone as tutor_phone,
    t.experienceYears,
    t.specialties,
    a.status,
    a.isConfirmed,
    a.declineReason,
    a.created_at as applied_at,
    a.approved_at,
    a.response_at,
    CASE 
        WHEN a.status = 'applied' THEN N'Đã ứng tuyển'
        WHEN a.status = 'approved' AND a.isConfirmed IS NULL THEN N'Đã được duyệt, chờ gia sư xác nhận'
        WHEN a.status = 'approved' AND a.isConfirmed = 1 THEN N'Gia sư đã xác nhận'
        WHEN a.status = 'approved' AND a.isConfirmed = 0 THEN N'Gia sư đã từ chối'
        WHEN a.status = 'withdrawn' THEN N'Đã rút đơn'
        WHEN a.status = 'rejected' THEN N'Bị từ chối'
        WHEN a.status = 'invitation_cancelled' THEN N'Lời mời đã bị hủy'
    END as status_description
FROM Applications a
JOIN Tutor t ON a.tutor_id = t.id
JOIN [User] u ON t.user_id = u.id
WHERE a.class_id = 1
ORDER BY 
    CASE 
        WHEN a.status = 'approved' AND a.isConfirmed IS NULL THEN 1
        WHEN a.status = 'applied' THEN 2
        WHEN a.status = 'approved' AND a.isConfirmed = 1 THEN 3
        WHEN a.status = 'approved' AND a.isConfirmed = 0 THEN 4
        WHEN a.status = 'withdrawn' THEN 5
        WHEN a.status = 'rejected' THEN 6
        WHEN a.status = 'invitation_cancelled' THEN 7
    END,
    a.created_at DESC;

-- 37. Dashboard cho phụ huynh - trạng thái các lớp học
SELECT 
    c.id as class_id,
    sub.name as subject_name,
    c.status as class_status,
    c.isLocked,
    CASE WHEN c.tutor_id IS NOT NULL THEN tu_user.fullName ELSE N'Chưa có' END as current_tutor,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
    c.created_at
FROM Class c
JOIN Subject sub ON c.subject_id = sub.id
LEFT JOIN Tutor tu ON c.tutor_id = tu.id
LEFT JOIN [User] tu_user ON tu.user_id = tu_user.id
LEFT JOIN Applications a ON c.id = a.class_id
WHERE c.student_id = 1  -- ID học viên
GROUP BY c.id, sub.name, c.status, c.isLocked, c.tutor_id, tu_user.fullName, c.created_at
ORDER BY c.created_at DESC;

-- 38. Dashboard cho gia sư - đơn ứng tuyển cần phản hồi
SELECT 
    a.id as application_id,
    c.id as class_id,
    st_user.fullName as student_name,
    st_user.phone as student_phone,
    sub.name as subject_name,
    st.gradeLevel,
    st.school,
    a.approved_at,
    DATEDIFF(HOUR, a.approved_at, GETDATE()) as hours_since_approved,
    CASE 
        WHEN DATEDIFF(HOUR, a.approved_at, GETDATE()) > 24 THEN N'Quá hạn phản hồi'
        ELSE N'Cần phản hồi'
    END as urgency
FROM Applications a
JOIN Class c ON a.class_id = c.id
JOIN Student st ON c.student_id = st.id
JOIN [User] st_user ON st.user_id = st_user.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE a.tutor_id = 1  -- ID gia sư
  AND a.status = 'approved' 
  AND a.isConfirmed IS NULL  -- Chưa xác nhận
ORDER BY a.approved_at;

-- 39. Lịch sử đơn ứng tuyển của gia sư
SELECT 
    a.id as application_id,
    c.id as class_id,
    st_user.fullName as student_name,
    sub.name as subject_name,
    a.status,
    a.isConfirmed,
    a.declineReason,
    a.created_at as applied_at,
    a.approved_at,
    a.response_at,
    CASE 
        WHEN a.status = 'applied' THEN N'Đã ứng tuyển'
        WHEN a.status = 'approved' AND a.isConfirmed = 1 THEN N'Đã xác nhận lớp học'
        WHEN a.status = 'approved' AND a.isConfirmed = 0 THEN N'Đã từ chối lời mời'
        WHEN a.status = 'withdrawn' THEN N'Đã rút đơn'
        WHEN a.status = 'rejected' THEN N'Bị từ chối'
        WHEN a.status = 'invitation_cancelled' THEN N'Lời mời bị hủy'
    END as status_description
FROM Applications a
JOIN Class c ON a.class_id = c.id
JOIN Student st ON c.student_id = st.id
JOIN [User] st_user ON st.user_id = st_user.id
JOIN Subject sub ON c.subject_id = sub.id
WHERE a.tutor_id = 1  -- ID gia sư
ORDER BY a.created_at DESC;

-- 40. Thống kê đơn ứng tuyển theo trạng thái
SELECT 
    status,
    COUNT(CASE WHEN isConfirmed = 1 THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN isConfirmed = 0 THEN 1 END) as declined_count,
    COUNT(CASE WHEN isConfirmed IS NULL THEN 1 END) as pending_response_count,
    COUNT(*) as total_count
FROM Applications
WHERE tutor_id = 1  -- ID gia sư
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'approved' THEN 1
        WHEN 'applied' THEN 2
        WHEN 'withdrawn' THEN 3
        WHEN 'rejected' THEN 4
        WHEN 'invitation_cancelled' THEN 5
    END;
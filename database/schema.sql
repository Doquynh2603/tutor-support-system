-- =====================================================
-- TUTOR SUPPORT SYSTEM DATABASE SCHEMA - SQL SERVER
-- =====================================================

-- Drop existing database if exists and create new one
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'tutor_support_system')
BEGIN
    DROP DATABASE tutor_support_system;
END
GO

CREATE DATABASE tutor_support_system;
GO

USE tutor_support_system;
GO

-- =====================================================
-- LOCATION TABLES (Geographic Data)
-- =====================================================

-- Province table
CREATE TABLE Province_Id (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL
);

-- Ward table
CREATE TABLE Ward (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    province_id BIGINT,
    FOREIGN KEY (province_id) REFERENCES Province_Id(id) ON DELETE CASCADE
);

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- Main User table
CREATE TABLE [User] (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    fullName NVARCHAR(255) NOT NULL,
    dateOfBirth DATE,
    address_id BIGINT,
    role NVARCHAR(50) NOT NULL,
    phone NVARCHAR(20),
    locationDetail NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (address_id) REFERENCES Ward(id) ON DELETE SET NULL
);

-- Student table (extends User)
CREATE TABLE Student (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    gradeLevel INT NOT NULL,
    school NVARCHAR(255),
    user_id BIGINT UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE
);

-- Tutor table (extends User)
CREATE TABLE Tutor (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    introduction NVARCHAR(1000),
    experienceYears INT DEFAULT 0,
    teachingStyle NVARCHAR(500),
    specialties NVARCHAR(500),
    verified BIT DEFAULT 0,
    user_id BIGINT UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE
);

-- =====================================================
-- SUBJECT AND CLASS TABLES
-- =====================================================

-- Subject table
CREATE TABLE Subject (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    [desc] NVARCHAR(1000),
    educationLevel INT NOT NULL
);

-- Class table
CREATE TABLE Class (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id BIGINT NOT NULL,
    tutor_id BIGINT NULL, -- Có thể null khi đang tuyển gia sư
    subject_id BIGINT NOT NULL,
    status NVARCHAR(20) DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'has_tutor', 'in_progress', 'completed', 'cancelled')),
    isLocked BIT DEFAULT 0, -- 0: chưa khóa, 1: có gia sư được duyệt đang chờ phản hồi (không cho duyệt thêm)
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Student(id) ON DELETE NO ACTION,
    FOREIGN KEY (tutor_id) REFERENCES Tutor(id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES Subject(id) ON DELETE CASCADE
);

-- =====================================================
-- SCHEDULING TABLES
-- =====================================================

-- Schedule table
CREATE TABLE Schedule (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    class_id BIGINT NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),  -- 1=Mon, 2=Tue, ..., 5=Fri, 6=Sat, 7=Sun
    start_time TIME NOT NULL,                -- HH:MM (VD: 14:00 = 2PM)
    end_time TIME NOT NULL,                  -- HH:MM (VD: 15:30 = 3:30PM)
    start_date DATE NOT NULL,                -- Ngày bắt đầu lịch
    end_date DATE NULL,                      -- Ngày kết thúc (NULL = vô thời hạn)
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE
);

-- =====================================================
-- APPLICATION TABLES
-- =====================================================

-- Applications table
CREATE TABLE Applications (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tutor_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    status NVARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'withdrawn', 'rejected', 'invitation_cancelled')),
    approved_at DATETIME NULL, -- Thời gian phụ huynh duyệt
    response_at DATETIME NULL, -- Thời gian gia sư phản hồi
    isConfirmed BIT NULL, -- NULL: chưa phản hồi, 1: xác nhận, 0: từ chối
    declineReason NVARCHAR(500) NULL, -- Lý do từ chối (có thể null)
    withdrawReason NVARCHAR(1000) NULL, -- Lý do rút đơn (có thể null)
    FOREIGN KEY (tutor_id) REFERENCES Tutor(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE
);

-- =====================================================
-- ASSIGNMENT AND DOCUMENT TABLES
-- =====================================================

-- Assignments table
CREATE TABLE Assignments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    grade_id BIGINT,
    class_id BIGINT NOT NULL,
    start DATETIME NOT NULL,
    [end] DATETIME,
    subject_id BIGINT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subject(id) ON DELETE NO ACTION
);

-- StudyDocuments table
CREATE TABLE StudyDocuments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    class_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500),
    file_size BIGINT,
    [desc] NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subject(id) ON DELETE NO ACTION
);

-- =====================================================
-- COMMUNICATION TABLES
-- =====================================================

-- ConversationsMetaData table
CREATE TABLE ConversationsMetaData (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    person1_id BIGINT NOT NULL,
    person2_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (person1_id) REFERENCES [User](id) ON DELETE NO ACTION,
    FOREIGN KEY (person2_id) REFERENCES [User](id) ON DELETE NO ACTION
);

-- =====================================================
-- SOCIAL FEATURES
-- =====================================================

-- FavouriteTutor table
CREATE TABLE FavouriteTutor (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    student_id BIGINT NOT NULL,
    tutor_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (student_id) REFERENCES Student(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES Tutor(id) ON DELETE NO ACTION,
    CONSTRAINT unique_favourite UNIQUE (student_id, tutor_id)
);

-- PostMetaData table
CREATE TABLE PostMetaData (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    visibility NVARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends')),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User table indexes
CREATE INDEX idx_user_email ON [User](email);
CREATE INDEX idx_user_role ON [User](role);

-- Class table indexes
CREATE INDEX idx_class_student ON Class(student_id);
CREATE INDEX idx_class_tutor ON Class(tutor_id);
CREATE INDEX idx_class_subject ON Class(subject_id);
CREATE INDEX idx_class_status ON Class(status);
CREATE INDEX idx_class_locked ON Class(isLocked);

-- Schedule table indexes
CREATE INDEX idx_schedule_class ON Schedule(class_id);
CREATE INDEX idx_schedule_day ON Schedule(day_of_week);

-- Assignment table indexes
CREATE INDEX idx_assignment_class ON Assignments(class_id);
CREATE INDEX idx_assignment_subject ON Assignments(subject_id);
CREATE INDEX idx_assignment_start ON Assignments(start);

-- Application table indexes
CREATE INDEX idx_application_tutor ON Applications(tutor_id);
CREATE INDEX idx_application_class ON Applications(class_id);
CREATE INDEX idx_application_status ON Applications(status);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample provinces
INSERT INTO Province_Id (name) VALUES 
(N'Hồ Chí Minh'),
(N'Hà Nội'),
(N'Đà Nẵng'),
(N'Cần Thơ'),
(N'Hải Phòng');

-- Insert sample wards
INSERT INTO Ward (name, province_id) VALUES 
(N'Quận 1', 1),
(N'Quận 2', 1),
(N'Quận 3', 1),
(N'Ba Đình', 2),
(N'Hoàn Kiếm', 2),
(N'Hai Châu', 3);

-- Insert sample subjects
INSERT INTO Subject (name, [desc], educationLevel) VALUES 
(N'Toán học', N'Môn toán từ cơ bản đến nâng cao', 12),
(N'Vật lý', N'Môn vật lý trung học phổ thông', 12),
(N'Hóa học', N'Môn hóa học cơ bản và nâng cao', 12),
(N'Tiếng Anh', N'Môn tiếng Anh giao tiếp và học thuật', 12),
(N'Văn học', N'Văn học Việt Nam và thế giới', 12);

-- Insert sample users
INSERT INTO [User] (email, password, fullName, dateOfBirth, address_id, role, phone, locationDetail) VALUES 
('student1@example.com', '$2a$10$hash1', N'Nguyễn Văn An', '2008-03-15', 1, 'student', '0901234567', N'Số 123 đường ABC'),
('student2@example.com', '$2a$10$hash2', N'Trần Thị Bình', '2007-08-22', 2, 'student', '0901234568', N'Số 456 đường DEF'),
('tutor1@example.com', '$2a$10$hash3', N'Lê Văn Cường', '1996-12-10', 1, 'tutor', '0901234569', N'Số 789 đường GHI'),
('tutor2@example.com', '$2a$10$hash4', N'Phạm Thị Dung', '1999-05-18', 3, 'tutor', '0901234570', N'Số 101 đường JKL');

-- Insert sample students
INSERT INTO Student (gradeLevel, school, user_id) VALUES 
(11, N'THPT Nguyễn Huệ', 1),
(12, N'THPT Lê Quý Đôn', 2);

-- Insert sample tutors
INSERT INTO Tutor (introduction, experienceYears, teachingStyle, specialties, verified, user_id) VALUES 
(N'Tôi có 5 năm kinh nghiệm dạy toán', 5, N'Tương tác, thực hành nhiều', N'Toán học, Vật lý', 1, 3),
(N'Chuyên gia tiếng Anh với bằng IELTS 8.0', 3, N'Giao tiếp trực tiếp', N'Tiếng Anh', 1, 4);

-- Insert sample classes (chúng ta sẽ tạo nhiều lớp để có dữ liệu lịch học phong phú)
-- Thêm thêm students và tutors để có nhiều lớp
INSERT INTO [User] (email, password, fullName, dateOfBirth, address_id, role, phone, locationDetail) VALUES 
('student3@example.com', '$2a$10$hash5', N'Vũ Quốc Minh', '2008-06-05', 2, 'student', '0901234571', N'Số 234 đường MNO'),
('student4@example.com', '$2a$10$hash6', N'Hoàng Thị Linh', '2009-11-12', 3, 'student', '0901234572', N'Số 567 đường PQR'),
('tutor3@example.com', '$2a$10$hash7', N'Đặng Văn Hùng', '1998-02-28', 2, 'tutor', '0901234573', N'Số 890 đường STU'),
('tutor4@example.com', '$2a$10$hash8', N'Bùi Thị Hoa', '2000-07-14', 1, 'tutor', '0901234574', N'Số 345 đường VWX');

INSERT INTO Student (gradeLevel, school, user_id) VALUES 
(10, N'THPT Trần Hưng Đạo', 3),
(11, N'THPT Nguyễn Trãi', 4);

INSERT INTO Tutor (introduction, experienceYears, teachingStyle, specialties, verified, user_id) VALUES 
(N'Giáo viên Hóa học có 4 năm kinh nghiệm', 4, N'Thực nghiệm, tương tác', N'Hóa học, Sinh học', 1, 5),
(N'Chuyên dạy Văn học Việt Nam', 6, N'Phân tích sâu, thảo luận nhóm', N'Văn học, Sử địa', 1, 6);

-- Thêm nhiều tutor khác để có đủ dữ liệu
INSERT INTO [User] (email, password, fullName, dateOfBirth, address_id, role, phone, locationDetail) VALUES 
('tutor5@example.com', '$2a$10$hash9', N'Trương Minh Tú', '1997-04-20', 1, 'tutor', '0901234575', N'Số 678 đường YZA'),
('tutor6@example.com', '$2a$10$hash10', N'Ngô Thị Hương', '2001-09-15', 2, 'tutor', '0901234576', N'Số 901 đường BCD'),
('tutor7@example.com', '$2a$10$hash11', N'Võ Quang Huy', '1995-12-03', 3, 'tutor', '0901234577', N'Số 234 đường EFG'),
('tutor8@example.com', '$2a$10$hash12', N'Lâm Thị Thúy', '2000-06-28', 1, 'tutor', '0901234578', N'Số 567 đường HIJ');

INSERT INTO Tutor (introduction, experienceYears, teachingStyle, specialties, verified, user_id) VALUES 
(N'Giáo viên Toán học với bằng cấp cao', 7, N'Giảng dạy chi tiết, có tài liệu', N'Toán học, Lý thuyết', 1, 7),
(N'Gia sư tiếng Anh native speaker', 5, N'Giao tiếp tự nhiên', N'Tiếng Anh, TOEFL', 1, 8),
(N'Chuyên gia Vật lý ứng dụng', 8, N'Thực hành, giải bài tập', N'Vật lý, Cơ học', 1, 9),
(N'Giáo viên Hóa học kinh nghiệm', 4, N'Thí nghiệm, khám phá', N'Hóa học, Hóa hữu cơ', 1, 10);

-- Thêm nhiều student khác
INSERT INTO [User] (email, password, fullName, dateOfBirth, address_id, role, phone, locationDetail) VALUES 
('student5@example.com', '$2a$10$hash13', N'Phan Văn Long', '2008-01-10', 1, 'student', '0901234579', N'Số 890 đường KLM'),
('student6@example.com', '$2a$10$hash14', N'Tạ Thị Hà', '2009-05-17', 2, 'student', '0901234580', N'Số 123 đường NOP'),
('student7@example.com', '$2a$10$hash15', N'Đinh Quốc Nam', '2007-11-22', 3, 'student', '0901234581', N'Số 456 đường QRS'),
('student8@example.com', '$2a$10$hash16', N'Chế Thị Mai', '2008-08-09', 2, 'student', '0901234582', N'Số 789 đường TUV');

INSERT INTO Student (gradeLevel, school, user_id) VALUES 
(12, N'THPT Trần Đại Nghĩa', 11),
(10, N'THPT Chu Văn An', 12),
(11, N'THPT Lê Quý Đôn', 13),
(12, N'THPT Nguyễn Trãi', 14);

-- Insert sample classes
INSERT INTO Class (student_id, tutor_id, subject_id, status, isLocked, created_at) VALUES 
(1, 1, 1, 'in_progress', 0, GETDATE()),      -- Class 1: Toán - Tutor 1
(2, 2, 4, 'in_progress', 0, GETDATE()),      -- Class 2: Tiếng Anh - Tutor 2
(1, NULL, 2, 'recruiting', 0, GETDATE()),    -- Class 3: Vật lý - Chưa có gia sư
(2, NULL, 5, 'recruiting', 0, GETDATE()),    -- Class 4: Văn học - Chưa có gia sư
(3, 3, 3, 'in_progress', 0, GETDATE()),      -- Class 5: Hóa học - Tutor 3
(4, 4, 5, 'in_progress', 0, GETDATE()),      -- Class 6: Văn học - Tutor 4
(3, NULL, 1, 'recruiting', 0, GETDATE()),    -- Class 7: Toán - Chưa có gia sư
(4, NULL, 4, 'recruiting', 0, GETDATE()),    -- Class 8: Tiếng Anh - Chưa có gia sư
(5, 5, 1, 'in_progress', 0, GETDATE()),      -- Class 9: Toán - Tutor 5
(6, 6, 2, 'in_progress', 0, GETDATE()),      -- Class 10: Vật lý - Tutor 6
(7, NULL, 3, 'recruiting', 0, GETDATE()),    -- Class 11: Hóa học - Chưa có gia sư
(8, NULL, 4, 'recruiting', 0, GETDATE()),    -- Class 12: Tiếng Anh - Chưa có gia sư
(5, 7, 2, 'recruiting', 0, GETDATE()),       -- Class 13: Vật lý - Tutor 7 có thể dạy
(6, 8, 3, 'recruiting', 0, GETDATE());

-- Insert sample schedules (lịch học chi tiết cho các lớp)
-- Lớp 1: Toán - Thứ 2, 3, 5 từ 14:00 - 15:30
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(1, 2, '14:00', '15:30', '2025-01-06', '2025-12-31', GETDATE()),  -- Thứ 2
(1, 3, '14:00', '15:30', '2025-01-07', '2025-12-31', GETDATE()),  -- Thứ 3
(1, 5, '14:00', '15:30', '2025-01-09', '2025-12-31', GETDATE());  -- Thứ 5

-- Lớp 2: Tiếng Anh - Thứ 4, 6 từ 16:00 - 17:30
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(2, 4, '16:00', '17:30', '2025-01-08', '2025-12-31', GETDATE()),  -- Thứ 4
(2, 6, '16:00', '17:30', '2025-01-10', '2025-12-31', GETDATE());  -- Thứ 6

-- Lớp 3: Vật lý - Thứ 2, 4 từ 17:00 - 18:30
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(3, 2, '17:00', '18:30', '2025-01-06', '2025-12-31', GETDATE()),  -- Thứ 2
(3, 4, '17:00', '18:30', '2025-01-08', '2025-12-31', GETDATE());  -- Thứ 4

-- Lớp 4: Văn học - Thứ 3, 5, 7 từ 15:00 - 16:30
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(4, 3, '15:00', '16:30', '2025-01-07', '2025-12-31', GETDATE()),  -- Thứ 3
(4, 5, '15:00', '16:30', '2025-01-09', '2025-12-31', GETDATE()),  -- Thứ 5
(4, 7, '15:00', '16:30', '2025-01-11', '2025-12-31', GETDATE());  -- Chủ nhật

-- Lớp 5: Hóa học - Thứ 2, 4, 6 từ 18:00 - 19:30
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(5, 2, '18:00', '19:30', '2025-01-06', '2025-12-31', GETDATE()),  -- Thứ 2
(5, 4, '18:00', '19:30', '2025-01-08', '2025-12-31', GETDATE()),  -- Thứ 4
(5, 6, '18:00', '19:30', '2025-01-10', '2025-12-31', GETDATE());  -- Thứ 6

-- Lớp 6: Văn học - Thứ 3, 5 từ 17:00 - 18:00
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(6, 3, '17:00', '18:00', '2025-01-07', '2025-12-31', GETDATE()),  -- Thứ 3
(6, 5, '17:00', '18:00', '2025-01-09', '2025-12-31', GETDATE()),  -- Thứ 5
(6, 7, '10:00', '11:30', '2025-01-11', '2025-12-31', GETDATE());  -- Chủ nhật sáng

-- Lớp 7: Toán - Thứ 2, 5 từ 16:00 - 17:00
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(7, 2, '16:00', '17:00', '2025-01-06', '2025-06-30', GETDATE()),  -- Thứ 2 (kết thúc tháng 6)
(7, 5, '16:00', '17:00', '2025-01-09', '2025-06-30', GETDATE());  -- Thứ 5 (kết thúc tháng 6)

-- Lớp 8: Tiếng Anh - Thứ 3, 6 từ 15:00 - 16:00
INSERT INTO Schedule (class_id, day_of_week, start_time, end_time, start_date, end_date, created_at) VALUES 
(8, 3, '15:00', '16:00', '2025-02-03', '2025-12-31', GETDATE()),  -- Thứ 3 (bắt đầu từ tháng 2)
(8, 6, '15:00', '16:00', '2025-02-07', '2025-12-31', GETDATE());  -- Thứ 6 (bắt đầu từ tháng 2)

-- =====================================================
-- SAMPLE DATA FOR APPLICATIONS
-- =====================================================

-- Insert sample applications với các trạng thái khác nhau
INSERT INTO Applications (tutor_id, class_id, status, created_at, withdrawReason) VALUES 
-- Các ứng tuyển đang chờ duyệt
(1, 3, 'applied', GETDATE(), NULL),  -- Application 1: Tutor 1 ứng tuyển Class 3 (Vật lý)
(2, 3, 'applied', DATEADD(DAY, -1, GETDATE()), NULL),  -- Application 2: Tutor 2 ứng tuyển Class 3 (chưa duyệt)

-- Ứng tuyển đã được duyệt (chờ gia sư phản hồi)
(3, 7, 'approved', DATEADD(DAY, -5, GETDATE()), NULL),  -- Application 3: Tutor 3 ứng tuyển Class 7, phụ huynh đã duyệt
(4, 1, 'approved', DATEADD(DAY, -3, GETDATE()), NULL),  -- Application 4: Tutor 4 ứng tuyển Class 1, phụ huynh đã duyệt

-- Ứng tuyển đã rút
(2, 8, 'withdrawn', DATEADD(DAY, -7, GETDATE()), N'Bận không thể dạy thêm'),  -- Application 5: Tutor 2 rút đơn Class 8
(3, 4, 'rejected', DATEADD(DAY, -10, GETDATE()), NULL),  -- Application 6: Tutor 3 ứng tuyển Class 4, phụ huynh từ chối
(1, 5, 'invitation_cancelled', DATEADD(DAY, -15, GETDATE()), NULL),  -- Application 7: Tutor 1 mời Class 5, lệnh mời hủy

-- Thêm nhiều ứng tuyển khác để có đủ dữ liệu test
(5, 3, 'applied', DATEADD(DAY, -2, GETDATE()), NULL),  -- Application 8: Tutor 5 ứng tuyển Class 3 (Vật lý) - applied
(6, 3, 'applied', DATEADD(DAY, -1, GETDATE()), NULL),  -- Application 9: Tutor 6 ứng tuyển Class 3 - applied
(7, 4, 'applied', GETDATE(), NULL),  -- Application 10: Tutor 7 ứng tuyển Class 4 - applied
(8, 7, 'applied', DATEADD(DAY, -3, GETDATE()), NULL),  -- Application 11: Tutor 8 ứng tuyển Class 7 - applied

-- Approved applications (chờ xác nhận)
(5, 11, 'approved', DATEADD(DAY, -4, GETDATE()), NULL),  -- Application 12: Tutor 5 ứng tuyển Class 11 - approved
(6, 12, 'approved', DATEADD(DAY, -2, GETDATE()), NULL),  -- Application 13: Tutor 6 ứng tuyển Class 12 - approved
(7, 13, 'approved', DATEADD(DAY, -1, GETDATE()), NULL),  -- Application 14: Tutor 7 ứng tuyển Class 13 - approved

-- Withdrawn applications (đã rút)
(8, 11, 'withdrawn', DATEADD(DAY, -6, GETDATE()), N'Không đủ thời gian'),  -- Application 15: Tutor 8 rút Class 11
(5, 4, 'withdrawn', DATEADD(DAY, -12, GETDATE()), N'Lịch không phù hợp'),  -- Application 16: Tutor 5 rút Class 4
(6, 8, 'withdrawn', DATEADD(DAY, -20, GETDATE()), N'Dạy khóa khác'),  -- Application 17: Tutor 6 rút Class 8

-- Rejected applications (bị từ chối)
(7, 11, 'rejected', DATEADD(DAY, -8, GETDATE()), NULL),  -- Application 18: Tutor 7 ứng tuyển Class 11, phụ huynh từ chối
(8, 12, 'rejected', DATEADD(DAY, -9, GETDATE()), NULL),  -- Application 19: Tutor 8 ứng tuyển Class 12, phụ huynh từ chối

-- Invitation cancelled
(5, 12, 'invitation_cancelled', DATEADD(DAY, -11, GETDATE()), NULL);  -- Application 20: Tutor 5 mời Class 12, lệnh mời bị hủy

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for complete user information
CREATE VIEW user_complete_info AS
SELECT 
    u.*,
    w.name as ward_name,
    p.name as province_name
FROM [User] u
LEFT JOIN Ward w ON u.address_id = w.id
LEFT JOIN Province_Id p ON w.province_id = p.id;

-- View for tutor with complete information (for profile management)
CREATE VIEW tutor_info AS
SELECT 
    -- Tutor specific fields
    t.id as tutor_id,
    t.introduction,
    t.experienceYears,
    t.teachingStyle,
    t.specialties,
    t.verified,
    -- User fields
    u.id as user_id,
    u.email,
    u.fullName,
    u.phone,
    u.dateOfBirth,
    DATEDIFF(YEAR, u.dateOfBirth, GETDATE()) as age, -- Tính tuổi từ ngày sinh
    u.role,
    u.locationDetail,
    u.created_at,
    u.updated_at,
    -- Location fields
    w.id as ward_id,
    w.name as ward_name,
    p.id as province_id,
    p.name as province_name
FROM Tutor t
JOIN [User] u ON t.user_id = u.id
LEFT JOIN Ward w ON u.address_id = w.id
LEFT JOIN Province_Id p ON w.province_id = p.id;

-- View for tutor classes (danh sách lớp học của gia sư kèm lịch học)
CREATE VIEW tutor_classes_view AS
SELECT 
    c.id as class_id,
    c.status,
    c.isLocked,
    c.created_at as class_created_at,
    c.updated_at as class_updated_at,
    sub.id as subject_id,
    sub.name as subject_name,
    sub.[desc] as subject_desc,
    sub.educationLevel,
    s.fullName as student_name,
    s.email as student_email,
    s.phone as student_phone,
    s.dateOfBirth as student_dob,
    DATEDIFF(YEAR, s.dateOfBirth, GETDATE()) as student_age,
    s.locationDetail as student_location,
    st.gradeLevel,
    st.school,
    st.user_id as student_user_id,
    st.id as student_id,
    w.id as ward_id,
    w.name as ward_name,
    p.id as province_id,
    p.name as province_name,
    t.id as tutor_id,
    tu.user_id as tutor_user_id,
    -- Schedule information
    sch.id as schedule_id,
    sch.day_of_week,
    sch.start_time,
    sch.end_time,
    sch.start_date,
    sch.end_date
FROM Class c
JOIN Subject sub ON c.subject_id = sub.id
JOIN Student st ON c.student_id = st.id
JOIN [User] s ON st.user_id = s.id
LEFT JOIN Ward w ON s.address_id = w.id
LEFT JOIN Province_Id p ON w.province_id = p.id
LEFT JOIN Tutor t ON c.tutor_id = t.id
LEFT JOIN [User] tu ON t.user_id = tu.id
LEFT JOIN Schedule sch ON c.id = sch.class_id;

-- View for class student profile (thông tin học viên kèm lớp học - chỉ lớp không phải recruiting)
CREATE VIEW class_student_profile_view AS
SELECT 
    c.id as class_id,
    c.status,
    c.isLocked,
    c.created_at as class_created_at,
    c.updated_at as class_updated_at,
    sub.id as subject_id,
    sub.name as subject_name,
    sub.[desc] as subject_desc,
    sub.educationLevel,
    s.id as student_id,
    u.id as user_id,
    u.email,
    u.fullName,
    u.phone,
    u.dateOfBirth,
    DATEDIFF(YEAR, u.dateOfBirth, GETDATE()) as age,
    u.locationDetail,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,
    s.gradeLevel,
    s.school,
    w.id as ward_id,
    w.name as ward_name,
    p.id as province_id,
    p.name as province_name,
    t.id as tutor_id,
    tu.id as tutor_user_id,
    tu.fullName as tutor_name,
    tu.email as tutor_email
FROM Student s
JOIN [User] u ON s.user_id = u.id
LEFT JOIN Ward w ON u.address_id = w.id
LEFT JOIN Province_Id p ON w.province_id = p.id
LEFT JOIN Class c ON s.id = c.student_id AND c.status != 'recruiting'
LEFT JOIN Subject sub ON c.subject_id = sub.id
LEFT JOIN Tutor t ON c.tutor_id = t.id
LEFT JOIN [User] tu ON t.user_id = tu.id;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT COLUMNS (SQL SERVER)
-- =====================================================

-- Trigger for User table updated_at
CREATE TRIGGER tr_User_UpdatedAt
ON [User]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [User] 
    SET updated_at = GETDATE() 
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO

-- Trigger for Class table updated_at  
CREATE TRIGGER tr_Class_UpdatedAt
ON Class
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Class 
    SET updated_at = GETDATE() 
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO

-- Trigger for ConversationsMetaData table updated_at
CREATE TRIGGER tr_ConversationsMetaData_UpdatedAt
ON ConversationsMetaData
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ConversationsMetaData 
    SET updated_at = GETDATE() 
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO

-- Trigger for PostMetaData table updated_at
CREATE TRIGGER tr_PostMetaData_UpdatedAt
ON PostMetaData
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE PostMetaData 
    SET updated_at = GETDATE() 
    WHERE id IN (SELECT DISTINCT id FROM Inserted);
END;
GO

-- Trigger to manage applications when tutor confirms/declines
CREATE TRIGGER tr_Applications_TutorConfirmation
ON Applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Khi gia sư xác nhận lớp (isConfirmed = 1), tự động gán vào lớp và từ chối đơn khác
    IF UPDATE(isConfirmed)
    BEGIN
        -- Gia sư xác nhận (FIRST COME FIRST SERVED)
        DECLARE @ClassId BIGINT, @TutorId BIGINT, @ApplicationId BIGINT;
        
        SELECT TOP 1 @ClassId = class_id, @TutorId = tutor_id, @ApplicationId = id
        FROM Inserted 
        WHERE isConfirmed = 1 AND status = 'approved'
        ORDER BY response_at ASC; -- Ai phản hồi trước thì được chấp nhận
        
        IF @ClassId IS NOT NULL
        BEGIN
            -- 🔒 Kiểm tra xem lớp đã có gia sư chưa (double-check)
            DECLARE @ExistingTutorId BIGINT;
            SELECT @ExistingTutorId = tutor_id FROM Class WHERE id = @ClassId;
            
            -- Chỉ xử lý nếu lớp chưa có gia sư
            IF @ExistingTutorId IS NULL
            BEGIN
                -- Gán gia sư vào lớp và chuyển trạng thái
                UPDATE Class 
                SET tutor_id = @TutorId, 
                    status = 'has_tutor',
                    isLocked = 0  -- Mở khóa vì đã có gia sư chính thức
                WHERE id = @ClassId AND tutor_id IS NULL; -- Double-check trong UPDATE
                
                -- Từ chối tất cả đơn ứng tuyển khác (kể cả đơn approved khác)
                UPDATE Applications 
                SET status = 'rejected'
                WHERE class_id = @ClassId 
                  AND id != @ApplicationId  -- Không reject chính đơn này
                  AND status IN ('applied', 'approved');
            END
            ELSE
            BEGIN
                -- Lớp đã có gia sư rồi, reject đơn này
                UPDATE Applications 
                SET status = 'rejected'
                WHERE id = @ApplicationId;
            END
        END
        
        -- Gia sư từ chối (isConfirmed = 0) - mở khóa để phụ huynh có thể duyệt gia sư khác
        SELECT @ClassId = class_id 
        FROM Inserted 
        WHERE isConfirmed = 0 AND status = 'approved';
        
        IF @ClassId IS NOT NULL
        BEGIN
            -- Đổi status của đơn bị từ chối thành 'rejected'
            UPDATE Applications 
            SET status = 'rejected'
            WHERE class_id = @ClassId AND isConfirmed = 0 AND status = 'approved';
            
            -- Mở khóa lớp ngay lập tức (vì chỉ có 1 đơn approved duy nhất)
            UPDATE Class 
            SET isLocked = 0 
            WHERE id = @ClassId;
        END
    END
END;
GO

-- =====================================================
-- STORED PROCEDURES FOR SAFE DELETE OPERATIONS
-- =====================================================

-- Procedure để xóa Student an toàn
CREATE PROCEDURE sp_DeleteStudent
    @StudentId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Xóa các lớp học của student
        DELETE FROM Class WHERE student_id = @StudentId;
        
        -- Xóa student
        DELETE FROM Student WHERE id = @StudentId;
        
        COMMIT TRANSACTION;
        PRINT N'Đã xóa học viên thành công';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Procedure để xóa Tutor an toàn
CREATE PROCEDURE sp_DeleteTutor
    @TutorId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Cập nhật các lớp học (set tutor_id = null thay vì xóa)
        UPDATE Class SET tutor_id = NULL, status = 'recruiting', isLocked = 0 
        WHERE tutor_id = @TutorId;
        
        -- Từ chối các đơn ứng tuyển của tutor này
        UPDATE Applications SET status = 'rejected' 
        WHERE tutor_id = @TutorId AND status IN ('applied', 'approved');
        
        -- Xóa favourite tutors của tutor này
        DELETE FROM FavouriteTutor WHERE tutor_id = @TutorId;
        
        -- Xóa tutor
        DELETE FROM Tutor WHERE id = @TutorId;
        
        COMMIT TRANSACTION;
        PRINT N'Đã xóa gia sư thành công';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Procedure để xóa User an toàn
CREATE PROCEDURE sp_DeleteUser
    @UserId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @UserRole NVARCHAR(50);
        SELECT @UserRole = role FROM [User] WHERE id = @UserId;
        
        IF @UserRole = 'student'
        BEGIN
            DECLARE @StudentId BIGINT;
            SELECT @StudentId = id FROM Student WHERE user_id = @UserId;
            IF @StudentId IS NOT NULL
                EXEC sp_DeleteStudent @StudentId;
        END
        ELSE IF @UserRole = 'tutor'
        BEGIN
            DECLARE @TutorId BIGINT;
            SELECT @TutorId = id FROM Tutor WHERE user_id = @UserId;
            IF @TutorId IS NOT NULL
                EXEC sp_DeleteTutor @TutorId;
        END
        
        -- Xóa conversations (set người còn lại thành null)
        UPDATE ConversationsMetaData 
        SET person2_id = NULL 
        WHERE person1_id = @UserId;
        
        UPDATE ConversationsMetaData 
        SET person1_id = NULL 
        WHERE person2_id = @UserId;
        
        -- Xóa user cuối cùng
        DELETE FROM [User] WHERE id = @UserId;
        
        COMMIT TRANSACTION;
        PRINT N'Đã xóa người dùng thành công';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Procedure để xóa Subject an toàn
CREATE PROCEDURE sp_DeleteSubject
    @SubjectId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Xóa assignments liên quan
        DELETE FROM Assignments WHERE subject_id = @SubjectId;
        
        -- Xóa study documents liên quan  
        DELETE FROM StudyDocuments WHERE subject_id = @SubjectId;
        
        -- Xóa classes liên quan (sẽ cascade xóa schedules, applications)
        DELETE FROM Class WHERE subject_id = @SubjectId;
        
        -- Xóa subject cuối cùng
        DELETE FROM Subject WHERE id = @SubjectId;
        
        COMMIT TRANSACTION;
        PRINT N'Đã xóa môn học thành công';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =====================================================
-- STORED PROCEDURES FOR APPLICATION MANAGEMENT
-- =====================================================

-- Procedure để phụ huynh duyệt gia sư an toàn (tránh race condition)
CREATE PROCEDURE sp_ApproveApplication
    @ApplicationId BIGINT,
    @ParentUserId BIGINT -- Để kiểm tra quyền
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 🔒 LOCK row để tránh race condition
        DECLARE @ClassId BIGINT, @TutorId BIGINT, @StudentId BIGINT;
        
        SELECT @ClassId = a.class_id, 
               @TutorId = a.tutor_id,
               @StudentId = c.student_id
        FROM Applications a
        JOIN Class c ON a.class_id = c.id
        WHERE a.id = @ApplicationId;
        
        -- Kiểm tra đơn ứng tuyển có tồn tại không
        IF @ClassId IS NULL
        BEGIN
            THROW 50001, N'Đơn ứng tuyển không tồn tại', 1;
        END
        
        -- Kiểm tra quyền: chỉ student của lớp học mới được duyệt
        IF NOT EXISTS (
            SELECT 1 FROM Student s 
            WHERE s.id = @StudentId AND s.user_id = @ParentUserId
        )
        BEGIN
            THROW 50002, N'Bạn không có quyền duyệt đơn này', 1;
        END
        
        -- 🔒 LOCK Class row để đảm bảo atomic check-and-update
        DECLARE @IsLocked BIT, @ClassStatus NVARCHAR(20);
        SELECT @IsLocked = isLocked, @ClassStatus = status
        FROM Class WITH (UPDLOCK, ROWLOCK) -- Khóa row này
        WHERE id = @ClassId;
        
        -- Kiểm tra xem lớp có đang tuyển gia sư không
        IF @ClassStatus != 'recruiting'
        BEGIN
            THROW 50003, N'Lớp học không ở trạng thái tuyển gia sư', 1;
        END
        
        -- Kiểm tra xem lớp đã bị khóa chưa
        IF @IsLocked = 1
        BEGIN
            THROW 50004, N'Lớp học đã có gia sư khác được duyệt đang chờ phản hồi', 1;
        END
        
        -- Kiểm tra xem đã có đơn nào approved chưa (chỉ áp dụng cho workflow duyệt đơn đơn lẻ)
        IF EXISTS (
            SELECT 1 FROM Applications 
            WHERE class_id = @ClassId AND status = 'approved'
        )
        BEGIN
            THROW 50005, N'Đã có gia sư khác được duyệt cho lớp này. Sử dụng chức năng mời nhiều gia sư nếu muốn mời thêm.', 1;
        END
        
        -- Kiểm tra trạng thái đơn ứng tuyển
        DECLARE @CurrentStatus NVARCHAR(30);
        SELECT @CurrentStatus = status FROM Applications WHERE id = @ApplicationId;
        
        IF @CurrentStatus != 'applied'
        BEGIN
            THROW 50006, N'Đơn ứng tuyển không ở trạng thái có thể duyệt', 1;
        END
        
        -- ✅ An toàn để approve
        UPDATE Applications 
        SET status = 'approved', 
            approved_at = GETDATE() 
        WHERE id = @ApplicationId;
        
        -- Khóa lớp học
        UPDATE Class 
        SET isLocked = 1 
        WHERE id = @ClassId;
        
        COMMIT TRANSACTION;
        
        SELECT N'Duyệt gia sư thành công. Chờ gia sư phản hồi.' as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- Procedure để gia sư xác nhận/từ chối lớp học
CREATE PROCEDURE sp_TutorConfirmClass
    @ApplicationId BIGINT,
    @TutorUserId BIGINT, -- Để kiểm tra quyền
    @IsConfirmed BIT,
    @DeclineReason NVARCHAR(500) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra quyền và trạng thái đơn
        DECLARE @TutorId BIGINT, @CurrentStatus NVARCHAR(30);
        SELECT @TutorId = a.tutor_id, @CurrentStatus = a.status
        FROM Applications a
        JOIN Tutor t ON a.tutor_id = t.id
        WHERE a.id = @ApplicationId AND t.user_id = @TutorUserId;
        
        IF @TutorId IS NULL
        BEGIN
            THROW 50001, N'Bạn không có quyền xác nhận đơn này', 1;
        END
        
        IF @CurrentStatus != 'approved'
        BEGIN
            THROW 50002, N'Đơn ứng tuyển chưa được phụ huynh duyệt', 1;
        END
        
        -- Kiểm tra đã phản hồi chưa
        DECLARE @ExistingConfirmation BIT;
        SELECT @ExistingConfirmation = isConfirmed 
        FROM Applications WHERE id = @ApplicationId;
        
        IF @ExistingConfirmation IS NOT NULL
        BEGIN
            THROW 50003, N'Bạn đã phản hồi đơn này rồi', 1;
        END
        
        -- Cập nhật application
        UPDATE Applications 
        SET isConfirmed = @IsConfirmed, 
            response_at = GETDATE(),
            declineReason = CASE WHEN @IsConfirmed = 0 THEN @DeclineReason ELSE NULL END
        WHERE id = @ApplicationId;
        
        -- Trigger sẽ tự động xử lý phần còn lại
        
        COMMIT TRANSACTION;
        
        SELECT CASE 
            WHEN @IsConfirmed = 1 THEN N'Xác nhận lớp học thành công'
            ELSE N'Từ chối lời mời thành công'
        END as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- Procedure để gia sư rút đơn ứng tuyển
CREATE PROCEDURE sp_WithdrawApplication
    @ApplicationId BIGINT,
    @TutorUserId BIGINT,
    @Reason NVARCHAR(1000) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra quyền
        DECLARE @TutorId BIGINT, @CurrentStatus NVARCHAR(30), @ClassId BIGINT;
        SELECT @TutorId = a.tutor_id, @CurrentStatus = a.status, @ClassId = a.class_id
        FROM Applications a WITH (UPDLOCK, ROWLOCK)
        JOIN Tutor t ON a.tutor_id = t.id
        WHERE a.id = @ApplicationId AND t.user_id = @TutorUserId;
        
        IF @TutorId IS NULL
        BEGIN
            THROW 50001, N'Bạn không có quyền rút đơn này', 1;
        END
        
        IF @CurrentStatus NOT IN ('applied', 'approved')
        BEGIN
            THROW 50002, N'Không thể rút đơn ở trạng thái hiện tại', 1;
        END
        
        -- Rút đơn với lý do
        UPDATE Applications 
        SET status = 'withdrawn',
            withdrawReason = @Reason,
            response_at = GETDATE()
        WHERE id = @ApplicationId;
        
        -- Nếu đang approved thì cần kiểm tra mở khóa lớp
        IF @CurrentStatus = 'approved'
        BEGIN
            DECLARE @ApprovedCount INT;
            SELECT @ApprovedCount = COUNT(*)
            FROM Applications WITH (UPDLOCK, ROWLOCK)
            WHERE class_id = @ClassId
              AND status = 'approved'
              AND id != @ApplicationId;
            
            IF @ApprovedCount = 0
            BEGIN
                UPDATE Class SET isLocked = 0 WHERE id = @ClassId;
            END
        END
        
        COMMIT TRANSACTION;
        
        SELECT N'Rút đơn ứng tuyển thành công' as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- =====================================================
-- STORED PROCEDURES FOR INVITATION WORKFLOW (1-to-many)
-- =====================================================

-- Procedure để phụ huynh mời nhiều gia sư cùng lúc
CREATE PROCEDURE sp_InviteTutors
    @ClassId BIGINT,
    @TutorIds NVARCHAR(MAX), -- "1,2,3,4" - Danh sách tutor IDs
    @ParentUserId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra quyền
        DECLARE @StudentId BIGINT;
        SELECT @StudentId = student_id FROM Class WHERE id = @ClassId;
        
        IF NOT EXISTS (
            SELECT 1 FROM Student s 
            WHERE s.id = @StudentId AND s.user_id = @ParentUserId
        )
        BEGIN
            THROW 50001, N'Bạn không có quyền mời gia sư cho lớp này', 1;
        END
        
        -- 🔒 LOCK Class để kiểm tra trạng thái
        DECLARE @ClassStatus NVARCHAR(20), @ExistingTutor BIGINT, @IsLocked BIT;
        SELECT @ClassStatus = status, @ExistingTutor = tutor_id, @IsLocked = isLocked
        FROM Class WITH (UPDLOCK, ROWLOCK) 
        WHERE id = @ClassId;
        
        -- Kiểm tra lớp có đang tuyển không
        IF @ClassStatus != 'recruiting'
        BEGIN
            THROW 50002, N'Lớp học không ở trạng thái tuyển gia sư', 1;
        END
        
        -- Kiểm tra lớp đã có gia sư chưa
        IF @ExistingTutor IS NOT NULL
        BEGIN
            THROW 50003, N'Lớp học đã có gia sư', 1;
        END
        
        -- Kiểm tra lớp đã bị khóa chưa (có lời mời đang chờ)
        IF @IsLocked = 1
        BEGIN
            THROW 50004, N'Lớp học đã có lời mời đang chờ phản hồi', 1;
        END
        
        -- Tạo applications cho từng gia sư được mời
        DECLARE @TutorId BIGINT;
        DECLARE @InvitedCount INT = 0;
        
        -- Split string và insert applications
        DECLARE tutor_cursor CURSOR FOR
        SELECT CAST(value AS BIGINT) FROM STRING_SPLIT(@TutorIds, ',')
        WHERE ISNUMERIC(value) = 1;
        
        OPEN tutor_cursor;
        FETCH NEXT FROM tutor_cursor INTO @TutorId;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Kiểm tra tutor tồn tại và verified
            IF EXISTS (
                SELECT 1 FROM Tutor t 
                JOIN [User] u ON t.user_id = u.id 
                WHERE t.id = @TutorId AND t.verified = 1 AND u.role = 'tutor'
            )
            BEGIN
                -- Kiểm tra chưa có application nào cho lớp này
                IF NOT EXISTS (
                    SELECT 1 FROM Applications 
                    WHERE class_id = @ClassId AND tutor_id = @TutorId
                )
                BEGIN
                    -- Tạo application với status = 'approved' (đã được mời)
                    INSERT INTO Applications (tutor_id, class_id, status, approved_at)
                    VALUES (@TutorId, @ClassId, 'approved', GETDATE());
                    
                    SET @InvitedCount = @InvitedCount + 1;
                END
            END
            
            FETCH NEXT FROM tutor_cursor INTO @TutorId;
        END
        
        CLOSE tutor_cursor;
        DEALLOCATE tutor_cursor;
        
        -- Kiểm tra có mời được gia sư nào không
        IF @InvitedCount = 0
        BEGIN
            THROW 50005, N'Không có gia sư hợp lệ nào được mời', 1;
        END
        
        -- Khóa lớp vì đã có gia sư được mời
        UPDATE Class SET isLocked = 1 WHERE id = @ClassId;
        
        COMMIT TRANSACTION;
        
        SELECT CONCAT(N'Đã mời ', @InvitedCount, N' gia sư. Chờ gia sư phản hồi.') as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- Procedure để phụ huynh hủy lời mời cụ thể
CREATE PROCEDURE sp_CancelInvitation
    @ApplicationId BIGINT,
    @ParentUserId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 🔒 LOCK Application và Class rows
        DECLARE @ClassId BIGINT, @StudentId BIGINT, @CurrentStatus NVARCHAR(30), @IsConfirmed BIT;
        
        SELECT @ClassId = a.class_id,
               @StudentId = c.student_id,
               @CurrentStatus = a.status,
               @IsConfirmed = a.isConfirmed
        FROM Applications a WITH (UPDLOCK, ROWLOCK)
        JOIN Class c ON a.class_id = c.id
        WHERE a.id = @ApplicationId;
        
        -- Kiểm tra quyền
        IF NOT EXISTS (
            SELECT 1 FROM Student s 
            WHERE s.id = @StudentId AND s.user_id = @ParentUserId
        )
        BEGIN
            THROW 50001, N'Bạn không có quyền hủy lời mời này', 1;
        END
        
        -- Chỉ có thể hủy đơn đang approved và chưa được gia sư phản hồi
        IF @CurrentStatus != 'approved'
        BEGIN
            THROW 50002, N'Chỉ có thể hủy lời mời đang chờ phản hồi', 1;
        END
        
        IF @IsConfirmed IS NOT NULL
        BEGIN
            THROW 50003, N'Gia sư đã phản hồi, không thể hủy lời mời', 1;
        END
        
        -- Hủy lời mời
        UPDATE Applications 
        SET status = 'invitation_cancelled' 
        WHERE id = @ApplicationId;
        
        -- Kiểm tra còn lời mời nào khác không
        IF NOT EXISTS (
            SELECT 1 FROM Applications 
            WHERE class_id = @ClassId 
            AND status = 'approved' 
            AND isConfirmed IS NULL
        )
        BEGIN
            -- Nếu không còn lời mời nào, mở khóa lớp
            UPDATE Class SET isLocked = 0 WHERE id = @ClassId;
        END
        
        COMMIT TRANSACTION;
        
        SELECT N'Hủy lời mời thành công' as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- Procedure để hủy TẤT CẢ lời mời của 1 lớp học
CREATE PROCEDURE sp_CancelAllInvitations
    @ClassId BIGINT,
    @ParentUserId BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra quyền
        DECLARE @StudentId BIGINT;
        SELECT @StudentId = student_id FROM Class WHERE id = @ClassId;
        
        IF NOT EXISTS (
            SELECT 1 FROM Student s 
            WHERE s.id = @StudentId AND s.user_id = @ParentUserId
        )
        BEGIN
            THROW 50001, N'Bạn không có quyền hủy lời mời cho lớp này', 1;
        END
        
        -- Đếm số lời mời sẽ bị hủy
        DECLARE @InvitationCount INT;
        SELECT @InvitationCount = COUNT(*)
        FROM Applications 
        WHERE class_id = @ClassId 
        AND status = 'approved' 
        AND isConfirmed IS NULL;
        
        IF @InvitationCount = 0
        BEGIN
            THROW 50002, N'Không có lời mời nào để hủy', 1;
        END
        
        -- Hủy tất cả lời mời chưa phản hồi
        UPDATE Applications 
        SET status = 'invitation_cancelled'
        WHERE class_id = @ClassId 
        AND status = 'approved' 
        AND isConfirmed IS NULL;
        
        -- Mở khóa lớp
        UPDATE Class SET isLocked = 0 WHERE id = @ClassId;
        
        COMMIT TRANSACTION;
        
        SELECT CONCAT(N'Đã hủy ', @InvitationCount, N' lời mời thành công') as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- Procedure để cải thiện sp_WithdrawApplication với race condition protection
ALTER PROCEDURE sp_WithdrawApplication
    @ApplicationId BIGINT,
    @TutorUserId BIGINT,
    @Reason NVARCHAR(1000) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 🔒 LOCK Application row để tránh race condition
        DECLARE @TutorId BIGINT, @CurrentStatus NVARCHAR(30), @ClassId BIGINT;
        
        SELECT @TutorId = a.tutor_id, 
               @CurrentStatus = a.status,
               @ClassId = a.class_id
        FROM Applications a WITH (UPDLOCK, ROWLOCK) -- LOCK ROW
        JOIN Tutor t ON a.tutor_id = t.id
        WHERE a.id = @ApplicationId AND t.user_id = @TutorUserId;
        
        -- Kiểm tra quyền
        IF @TutorId IS NULL
        BEGIN
            THROW 50001, N'Bạn không có quyền rút đơn này', 1;
        END
        
        -- Kiểm tra trạng thái (sau khi lock)
        IF @CurrentStatus NOT IN ('applied', 'approved')
        BEGIN
            THROW 50002, N'Không thể rút đơn ở trạng thái hiện tại', 1;
        END
        
        -- 🔒 Nếu đang approved, cần lock Class để tránh conflict với approve khác
        IF @CurrentStatus = 'approved'
        BEGIN
            -- Lock class row để đảm bảo atomic unlock
            DECLARE @ClassLocked BIT;
            SELECT @ClassLocked = isLocked 
            FROM Class WITH (UPDLOCK, ROWLOCK)
            WHERE id = @ClassId;
            
            -- Kiểm tra còn đơn approved khác không (sau khi rút đơn này)
            DECLARE @RemainingApproved INT;
            SELECT @RemainingApproved = COUNT(*)
            FROM Applications 
            WHERE class_id = @ClassId 
            AND status = 'approved' 
            AND id != @ApplicationId
            AND isConfirmed IS NULL;
            
            -- Nếu không còn đơn approved nào khác, mở khóa lớp
            IF @RemainingApproved = 0
            BEGIN
                UPDATE Class SET isLocked = 0 WHERE id = @ClassId;
            END
        END
        
        -- Rút đơn với lý do (atomic update)
        UPDATE Applications 
        SET status = 'withdrawn',
            withdrawReason = @Reason,
            response_at = GETDATE()
        WHERE id = @ApplicationId;
        
        COMMIT TRANSACTION;
        
        SELECT N'Rút đơn ứng tuyển thành công' as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- Procedure để cải thiện sp_TutorConfirmClass với race condition protection
ALTER PROCEDURE sp_TutorConfirmClass
    @ApplicationId BIGINT,
    @TutorUserId BIGINT, -- Để kiểm tra quyền
    @IsConfirmed BIT,
    @DeclineReason NVARCHAR(500) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 🔒 LOCK Application row để tránh spam click
        DECLARE @TutorId BIGINT, @CurrentStatus NVARCHAR(30), @ExistingConfirmation BIT;
        
        SELECT @TutorId = a.tutor_id, 
               @CurrentStatus = a.status,
               @ExistingConfirmation = a.isConfirmed
        FROM Applications a WITH (UPDLOCK, ROWLOCK) -- LOCK ROW
        JOIN Tutor t ON a.tutor_id = t.id
        WHERE a.id = @ApplicationId AND t.user_id = @TutorUserId;
        
        -- Kiểm tra quyền
        IF @TutorId IS NULL
        BEGIN
            THROW 50001, N'Bạn không có quyền xác nhận đơn này', 1;
        END
        
        -- Kiểm tra trạng thái (sau khi lock)
        IF @CurrentStatus != 'approved'
        BEGIN
            THROW 50002, N'Đơn ứng tuyển chưa được phụ huynh duyệt', 1;
        END
        
        -- Kiểm tra đã phản hồi chưa (sau khi lock)
        IF @ExistingConfirmation IS NOT NULL
        BEGIN
            THROW 50003, N'Bạn đã phản hồi đơn này rồi', 1;
        END
        
        -- Cập nhật application (atomic)
        UPDATE Applications 
        SET isConfirmed = @IsConfirmed, 
            response_at = GETDATE(),
            declineReason = CASE WHEN @IsConfirmed = 0 THEN @DeclineReason ELSE NULL END
        WHERE id = @ApplicationId;
        
        -- Trigger sẽ tự động xử lý phần còn lại
        
        COMMIT TRANSACTION;
        
        SELECT CASE 
            WHEN @IsConfirmed = 1 THEN N'Xác nhận lớp học thành công'
            ELSE N'Từ chối lời mời thành công'
        END as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- =====================================================
-- STORED PROCEDURES FOR PROFILE MANAGEMENT
-- =====================================================

-- Procedure để gia sư cập nhật thông tin cá nhân
CREATE PROCEDURE sp_UpdateTutorProfile
    @TutorUserId BIGINT,
    @FullName NVARCHAR(255) = NULL,
    @DateOfBirth DATE = NULL,
    @Phone NVARCHAR(20) = NULL,
    @WardId BIGINT = NULL,
    @LocationDetail NVARCHAR(500) = NULL,
    @Introduction NVARCHAR(1000) = NULL,
    @ExperienceYears INT = NULL,
    @TeachingStyle NVARCHAR(500) = NULL,
    @Specialties NVARCHAR(500) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra user có tồn tại và là tutor không
        DECLARE @UserId BIGINT, @TutorId BIGINT;
        
        SELECT @UserId = u.id, @TutorId = t.id
        FROM [User] u
        JOIN Tutor t ON u.id = t.user_id
        WHERE u.id = @TutorUserId AND u.role = 'tutor';
        
        IF @UserId IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy thông tin gia sư', 1;
        END
        
        -- Kiểm tra WardId có hợp lệ không (nếu được cung cấp)
        IF @WardId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Ward WHERE id = @WardId)
        BEGIN
            THROW 50002, N'Quận/Huyện không hợp lệ', 1;
        END
        
        -- Kiểm tra ngày sinh hợp lệ (không được trong tương lai và phải >= 16 tuổi)
        IF @DateOfBirth IS NOT NULL 
        BEGIN
            IF @DateOfBirth > GETDATE()
            BEGIN
                THROW 50003, N'Ngày sinh không thể trong tương lai', 1;
            END
            
            IF DATEDIFF(YEAR, @DateOfBirth, GETDATE()) < 16
            BEGIN
                THROW 50004, N'Tuổi phải từ 16 trở lên', 1;
            END
        END
        
        -- Cập nhật thông tin User (bao gồm address_id để lưu tỉnh/huyện)
        UPDATE [User] 
        SET fullName = ISNULL(@FullName, fullName),
            dateOfBirth = ISNULL(@DateOfBirth, dateOfBirth),
            phone = ISNULL(@Phone, phone),
            address_id = ISNULL(@WardId, address_id),
            locationDetail = ISNULL(@LocationDetail, locationDetail),
            updated_at = GETDATE()
        WHERE id = @UserId;
        
        -- Cập nhật thông tin Tutor (các thông tin về kinh nghiệm dạy học)
        UPDATE Tutor 
        SET introduction = ISNULL(@Introduction, introduction),
            experienceYears = ISNULL(@ExperienceYears, experienceYears),
            teachingStyle = ISNULL(@TeachingStyle, teachingStyle),
            specialties = ISNULL(@Specialties, specialties)
        WHERE id = @TutorId;
        
        COMMIT TRANSACTION;
        
        SELECT N'Cập nhật thông tin cá nhân thành công' as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO



-- Procedure để student cập nhật thông tin cá nhân
CREATE PROCEDURE sp_UpdateStudentProfile
    @StudentUserId BIGINT,
    @FullName NVARCHAR(255) = NULL,
    @DateOfBirth DATE = NULL,
    @Phone NVARCHAR(20) = NULL,
    @AddressId BIGINT = NULL,
    @LocationDetail NVARCHAR(500) = NULL,
    @GradeLevel INT = NULL,
    @School NVARCHAR(255) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Kiểm tra user có tồn tại và là student không
        DECLARE @UserId BIGINT, @StudentId BIGINT;
        
        SELECT @UserId = u.id, @StudentId = s.id
        FROM [User] u
        JOIN Student s ON u.id = s.user_id
        WHERE u.id = @StudentUserId AND u.role = 'student';
        
        IF @UserId IS NULL
        BEGIN
            THROW 50001, N'Không tìm thấy thông tin học viên', 1;
        END
        
        -- Kiểm tra địa chỉ có hợp lệ không (nếu được cung cấp)
        IF @AddressId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Ward WHERE id = @AddressId)
        BEGIN
            THROW 50002, N'Địa chỉ không hợp lệ', 1;
        END
        
        -- Kiểm tra ngày sinh hợp lệ
        IF @DateOfBirth IS NOT NULL 
        BEGIN
            IF @DateOfBirth > GETDATE()
            BEGIN
                THROW 50003, N'Ngày sinh không thể trong tương lai', 1;
            END
            
            IF DATEDIFF(YEAR, @DateOfBirth, GETDATE()) < 6
            BEGIN
                THROW 50004, N'Tuổi phải từ 6 trở lên', 1;
            END
        END
        
        -- Kiểm tra khối lớp hợp lệ
        IF @GradeLevel IS NOT NULL AND (@GradeLevel < 1 OR @GradeLevel > 12)
        BEGIN
            THROW 50005, N'Khối lớp phải từ 1 đến 12', 1;
        END
        
        -- Cập nhật thông tin User
        UPDATE [User] 
        SET fullName = ISNULL(@FullName, fullName),
            dateOfBirth = ISNULL(@DateOfBirth, dateOfBirth),
            phone = ISNULL(@Phone, phone),
            address_id = ISNULL(@AddressId, address_id),
            locationDetail = ISNULL(@LocationDetail, locationDetail),
            updated_at = GETDATE()
        WHERE id = @UserId;
        
        -- Cập nhật thông tin Student
        UPDATE Student 
        SET gradeLevel = ISNULL(@GradeLevel, gradeLevel),
            school = ISNULL(@School, school)
        WHERE id = @StudentId;
        
        COMMIT TRANSACTION;
        
        SELECT N'Cập nhật thông tin cá nhân thành công' as message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END;
GO

-- =====================================================
-- END OF SCHEMA
-- =====================================================
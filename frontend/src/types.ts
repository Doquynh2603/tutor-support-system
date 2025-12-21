export type Role = 'student' | 'tutor' | 'admin' | 'user' | string;

export interface UserAccount {
  user_id: string;
  name: string;
  role: Role;
  email: string;
  phone?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  is_verified: boolean;
  dateOfBirth?: string;
  locationDetail?: string;
  address_id?: string;
}
export interface Location {
  id: string; // UUID
  name: string;
}

export interface Province extends Location {}
export interface District extends Location {
  province_id: string;
}
export interface Ward extends Location {
  district_id: string;
}
export interface StudentProfile {
  student_id: string;
  school?: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  locationDetail?: string;
  created_at?: string;
  updated_at?: string;
  role?: Role;
  status?: boolean;
  is_verified?: boolean;
  gender?: boolean | null;
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
  gradeLevel?: number | null;
  [key: string]: unknown;
}

export type StudentSummary = Pick<
  StudentProfile,
  'student_profile_id' | 'name' | 'phone' | 'locationDetail'
>;

export interface TutorProfile {
  tutor_id: string;
  introduction?: string;
  experience_years?: number;
  subjects?: string[];
  hourly_rate?: number;
  avg_rating?: number;
  total_reviews?: number;
  user_id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  role?: Role;
  gender?: boolean | null;
  locationDetail?: string;
  created_at?: string;
  updated_at?: string;
  status?: boolean;
  is_verified?: boolean;
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
  [key: string]: unknown;
}

export interface ClassItem {
  class_id: string;
  class_status?: string;
  hourly_price?: string | number;
  requirement?: string;
  created_at?: string | Date;
  class_description?: string;
  subject_name: string;
  subject_desc?: string;
  gradeLevel?: number | string;
  school?: string;
  cancellation_reason?: string;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  student_location?: string;
  student_dob?: string;
  student_age?: number;
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
  schedules?: Schedule[];
  application_status?: string | null;
  hourly_rate?: number;
  hours_per_week?: number;
  [key: string]: unknown;
  classLevel?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface Schedule {
  schedule_id: string;
  class_id?: string;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassDetail {
  class_id: string;
  subject_id?: string;
  subject_name?: string;
  status?: string;
  is_locked?: boolean;
  created_at?: string;
  update_at?: string;
  hourly_price?: number;
  requirement?: string;
  classLevel?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
  cancellation_reason?: string;
  student_id?: string;
  locationDetail?: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
  schedules?: Schedule[] | null;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  student_gender?: boolean;
}

export interface TutorClass {
  class_id: string;
  tutor_id: string;
  student_id: string;
  hourly_price: number;
  classLevel: number | null;
  class_status: string;
  created_at: string;

  subject_id: string;
  subject_name: string;
  classLocation?: string | null;
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface Subject {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface StudentProfileFormProps {
  profile?: StudentProfile | null;
  provinces?: Province[];
  wards?: Ward[];
  onSave: (data: Partial<StudentProfile>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isLoadingProvinces?: boolean;
  isLoadingWards?: boolean;
  selectedProvinceId?: string | null;
  onProvinceChange: (provinceId: string | null) => void;
  validationErrors?: ValidationErrors;
}

export interface UpdateTutorProfilePayload {
  tutor_profile_id?: string;
  user_id?: string;
  name?: string;
  phone?: string;
  locationDetail?: string;
  dateOfBirth?: string;
  introduction?: string;
  experience_years?: number;
  subjects?: string[];
  address_id?: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
}
export interface UpdateStudentProfilePayload {
  student_profile_id?: string;
  user_id?: string;
  name?: string;
  phone?: string;
  locationDetail?: string;
  address_id?: string;
  dateOfBirth?: string;
  gradeLevel?: number | string;
  school?: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
}

export interface FavoritesTutor {
  favoriteId: string;
  student_id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  locationDetail?: string;
  bio?: string;
  hourly_rate?: number;
  experience_years?: number;
  avg_rating?: number;
  total_reviews?: number;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
}
export interface Subject {
  subject_id: string;
  name: string;
  description?: string;
}

export interface ApplicationListItem {
  application_id: string;
  tutor_id: string;
  application_status: string;
  class_id: string;
  applied_at: string;
  subject_name: string;
  classLevel?: number | null;
  classLocation?: string | null;
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
  isConfirmed?: boolean | null;
}
export interface Application {
  application_id: string;
  application_status: string;
  applied_at: string;
  approved_at?: string;
  cancellation_reason?: string;
  classLevel?: number | null;
  classLocation?: string | null;
  class_id: string;
  declineReason?: string;
  description?: string;
  district_name?: string | null;
  end_date?: string;
  gender?: boolean;
  hourly_price?: number;
  province_name?: string | null;
  requirement?: string;
  responsed_at?: string;
  start_date?: string;
  student_email?: string;
  student_name?: string;
  student_phone?: string;
  subject_name: string;
  tutor_id?: string | null;
  ward_name?: string | null;
  withdrawReason?: string | null;
  withdrawn_at?: string | null;
}

export interface CreateClassPayload {
  subject_id: string;
  description: string;
  requirement?: string;
  hourly_price: number;
  classLevel: number; // ✅ THÊM
  start_date: string; // ✅ THÊM: YYYY-MM-DD
  end_date: string; // ✅ THÊM: YYYY-MM-DD
  schedules: Array<{
    day_of_week: number; // 1-7
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    duration_minutes: number;
  }>;
}

export interface Notification {
  notification_id: string; // UUID
  receiver_id: string; // UUID
  sender_id: string; // UUID
  type: NotificationType;
  title: string;
  message: string;
  metadata: NotificationMetadata;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export type NotificationType =
  | 'TUTOR_INVITED'
  | 'APPLICATION_APPROVED_BY_STUDENT'
  | 'APPLICATION_REJECTED_BY_STUDENT'
  | 'CLASS_UPDATED'
  | 'CLASS_CANCELLED'
  | 'CLASS_CONFIRMED_BY_TUTOR'
  | 'CLASS_REJECTED_BY_TUTOR'
  | 'APPLICATION_AUTO_REJECTED_BY_SYSTEM';

export interface NotificationMetadata {
  targetPage: string;
  tab: string;
  classId?: string;
  applicationId?: string;
  className?: string;
  hourlyPrice?: number;
  studentName?: string;
  tutorName?: string;
  reason?: string;
  changes?: string;
  autoExpand?: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unread_count: number;
  };
  message: string;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

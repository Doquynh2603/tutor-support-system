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
  student_profile_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  locationDetail?: string;
  address_id?: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
  dateOfBirth?: string;
  gradeLevel?: number | string;
  school?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export type StudentSummary = Pick<
  StudentProfile,
  'student_profile_id' | 'name' | 'phone' | 'locationDetail'
>;

export interface TutorProfile {
  tutor_profile_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  locationDetail?: string;
  dateOfBirth?: string;
  bio?: string;
  experience_years?: number;
  subjects?: string;
  hourly_rate?: number;
  avg_rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
  address_id?: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
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
}

export interface Schedule {
  schedule_id: string;
  class_id?: string;
  day_of_week: number;
  start_date: string;
  end_date?: string;
  duration_minutes?: number;
  status?: string;
  recurrence_type?: string;
  lock_reason?: string;
  year_month?: number;
  original_schedule_id?: string;
}

export interface ClassDetail {
  class_id: string;
  subject_id?: string;
  subject_name?: string;
  subject_desc?: string;
  status?: string;
  is_locked?: boolean;
  created_at?: string;
  update_at?: string;
  hourly_price?: number;
  requirement?: string;
  description?: string;
  cancellation_reason?: string;
  // Student info
  student_id?: string;
  student_profile_id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gradeLevel?: number | string;
  school?: string;
  locationDetail?: string;
  address_id?: string;
  ward_name?: string;
  district_name?: string;
  province_name?: string;
  // Tutor info
  tutor_id?: string;
  tutor_profile_id?: string;
  tutor_name?: string;
  tutor_email?: string;
  schedules?: Schedule[];
}

export interface TutorClass {
  class_id: string;
  subject_id?: string;
  subject_name?: string;
  status?: string;
  student_id?: string;
  tutor_id?: string;
  schedules?: Schedule[];
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
  specialties?: string;
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

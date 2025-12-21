import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  BookOpen,
  User,
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useTutorClassDetail, useClassStudentProfile } from '../../hooks/useTutorClasses';
import StudentProfileModal from './StudentProfileModal';

import { ClassDetail } from '@/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface TutorClassDetailProps {
  classId: string;
  onBack: () => void;
}

/**
 * Chuyển day_of_week thành tên ngày
 */
const getDayName = (dayOfWeek: number): string => {
  const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  return days[dayOfWeek] || '';
};

/**
 * Format giờ từ chuỗi time
 */
const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeString;
  }
};

const TutorClassDetail: React.FC<TutorClassDetailProps> = ({ classId, onBack }) => {
  const [showStudentProfile, setShowStudentProfile] = useState(false);

  const {
    data: classDetailResponse,
    isLoading: classLoading,
    error: classError,
  } = useTutorClassDetail(classId);

  const { data: studentProfileResponse, isLoading: studentLoading } = useClassStudentProfile(
    classId,
    showStudentProfile
  );

  const classDetail: ClassDetail | undefined = classDetailResponse;
  const studentProfile = studentProfileResponse;

  console.log('TutorClassDetail - classDetailResponse:', classDetailResponse);
  console.log('TutorClassDetail - classDetail:', classDetail);
  console.log('TutorClassDetail - classLoading:', classLoading);
  console.log('TutorClassDetail - classError:', classError);
  console.log('TutorClassDetail - showStudentProfile:', showStudentProfile);
  console.log('TutorClassDetail - studentProfileResponse:', studentProfileResponse);
  console.log('TutorClassDetail - studentLoading:', studentLoading);

  // Render StudentProfileModal khi showStudentProfile = true
  if (showStudentProfile) {
    return (
      <StudentProfileModal
        student={studentProfile}
        isLoading={studentLoading}
        onBack={() => setShowStudentProfile(false)}
      />
    );
  }

  if (classLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin lớp học...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (classError || !classDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {classError?.message || 'Không thể tải thông tin lớp học'}
              </AlertDescription>
            </Alert>
            <Button onClick={onBack} className="w-full mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay Lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{classDetail.subject_name}</h1>
          <p className="text-muted-foreground mt-1">Chi tiết lớp học</p>
        </div>
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay Lại
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin lớp học */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Thông Tin Lớp Học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Môn học</label>
              <p className="font-semibold">{classDetail.subject_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Lớp</label>
              <p className="font-semibold">{classDetail.classLevel}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Mô tả</label>
              <p className="font-semibold">{classDetail.description || 'Không có'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Yêu cầu từ phụ huynh</label>
              <p className="font-semibold">{classDetail.requirement || 'Không có'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Trạng thái</label>
              <p className="font-semibold capitalize">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  {classDetail.status === 'in_progress' && '🎓 Đang Dạy'}
                  {classDetail.status === 'has_tutor' && '✅ Được Duyệt'}
                  {classDetail.status === 'recruiting' && '🔍 Đang Tuyển'}
                  {classDetail.status === 'completed' && '✔️ Hoàn Thành'}
                  {classDetail.status === 'cancelled' && '❌ Hủy Bỏ'}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Ngày tạo</label>
              <p className="font-semibold">
                {classDetail.created_at
                  ? dayjs.utc(classDetail.created_at).format('DD/MM/YYYY')
                  : ''}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ngày bắt đầu</label>
              <p className="font-semibold">
                {classDetail.start_date
                  ? dayjs.utc(classDetail.start_date).format('DD/MM/YYYY')
                  : ''}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ngày kết thúc</label>
              <p className="font-semibold">
                {classDetail.end_date ? dayjs.utc(classDetail.end_date).format('DD/MM/YYYY') : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin học viên */}
        <Card>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setShowStudentProfile(true)}
              className="w-full mt-6"
              variant="default"
            >
              <User className="h-4 w-4 mr-2" />
              Xem Thông Tin Học Viên
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Địa chỉ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Địa Chỉ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label className="text-sm text-muted-foreground">Tỉnh/Thành phố</label>
            <p className="font-semibold">{classDetail.province_name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Quận/Huyện</label>
            <p className="font-semibold">{classDetail.district_name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Xã</label>
            <p className="font-semibold">{classDetail.ward_name}</p>
          </div>
          {classDetail.locationDetail && (
            <div>
              <label className="text-sm text-muted-foreground">Chi tiết địa chỉ</label>
              <p className="font-semibold">{classDetail.locationDetail}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lịch học */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lịch Học
          </CardTitle>
          <CardDescription>Thời khóa biểu chi tiết của lớp học</CardDescription>
        </CardHeader>
        <CardContent>
          {classDetail.schedules && classDetail.schedules.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {classDetail.schedules.map((schedule) => (
                <div
                  key={schedule.schedule_id}
                  className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-2">
                        {getDayName(schedule.day_of_week)}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <span className="font-semibold">
                              {formatTime(schedule.start_date)} - {formatTime(schedule.end_date)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Từ {new Date(schedule.start_date).toLocaleDateString('vi-VN')}
                            {schedule.end_date && (
                              <>
                                {' - '}
                                {new Date(schedule.end_date).toLocaleDateString('vi-VN')}
                              </>
                            )}
                            {!schedule.end_date && ' (vô thời hạn)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có lịch học nào được thiết lập</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorClassDetail;

// frontend/src/pages/Student/ClassDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useClass } from '../../hooks/useClass';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  ArrowLeft,
  Mail,
  Phone,
  Star,
  Calendar,
  DollarSign,
  BookOpen,
  Loader2,
} from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
interface ClassDetailPageProps {
  onTabChange?: (tab: string) => void; // ✅ THÊM: Để navigate trong HomePage
}
const StudentClassDetailPage: React.FC<ClassDetailPageProps> = ({ onTabChange }) => {
  const { getClassDetails, loading } = useClass();
  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    const classId = sessionStorage.getItem('currentClassId');

    if (!classId) {
      console.warn('❌ Không có classId');
      return;
    }
    const fetchClassDetails = async () => {
      try {
        const result = await getClassDetails(classId);
        setClassData(result);
        console.log('dữ liệu chi tiết lớp học được lấy từ backend', result);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết lớp:', error);
      }
    };

    fetchClassDetails();
    return () => {};
  }, [getClassDetails]);
  const handleBackClick = () => {
    // ✅ SỬA: Quay lại search tab
    sessionStorage.removeItem('currentClassId');
    if (onTabChange) {
      onTabChange('search');
    }
  };
  if (loading || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-4">Đang tải chi tiết lớp học...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      recruiting: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tìm gia sư' },
      has_tutor: { bg: 'bg-green-100', text: 'text-green-800', label: 'Có gia sư' },
      active: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang học' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã kết thúc' },
    };

    const cfg = config[status] || config.recruiting;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  };
  const classDetail = classData.class;
  const schedules = Array.isArray(classData.schedules) ? classData.schedules : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackClick} // ✅ SỬA: navigate(-1) thay vì hardcode route
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          {getStatusBadge(classDetail.class_status)}
        </div>

        {/* Class Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{classDetail.subject_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{classDetail.description}</p>

            {classDetail.requirement && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Yêu cầu:</h3>
                <p className="text-gray-700">{classDetail.requirement}</p>
              </div>
            )}

            {/* Class Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Giá/Giờ</p>
                  <p className="font-semibold text-gray-900">
                    {classDetail.hourly_price?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Lịch Học</p>
                  <p className="font-semibold text-gray-900">{schedules.length} buổi/tuần</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Thời gian</p>
                  <p className="font-semibold text-gray-900">
                    {dayjs.utc(classDetail.start_date).format('DD/MM/YYYY')} -{' '}
                    {dayjs.utc(classDetail.end_date).format('DD/MM/YYYY')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        {schedules.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lịch Học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schedules.map((schedule: any, idx: number) => {
                  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                  const dayName = dayNames[schedule.day_of_week] || `Ngày ${schedule.day_of_week}`;
                  const durationHours = (schedule.duration_minutes / 60).toFixed(1);

                  return (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{dayName}</span>
                        <span className="text-sm text-gray-500">⏱️ {durationHours}h</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tutor Info */}
        {classDetail.tutor_id ? (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 mb-6">
            <CardHeader>
              <CardTitle className="text-green-900">👨‍🏫 Gia Sư Hướng Dẫn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên:</p>
                  <p className="font-semibold text-gray-900">{classDetail.tutor_name}</p>
                </div>

                {classDetail.tutor_rating && (
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá:</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900">
                        {classDetail.tutor_rating}
                      </span>
                      <span className="text-sm text-gray-600">/ 5.0</span>
                      {classDetail.tutor_reviews && (
                        <span className="text-sm text-gray-500">
                          ({classDetail.tutor_reviews} đánh giá)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {classDetail.tutor_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a
                    href={`mailto:${classDetail.tutor_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {classDetail.tutor_email}
                  </a>
                </div>
              )}

              {classDetail.tutor_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${classDetail.tutor_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {classDetail.tutor_phone}
                  </a>
                </div>
              )}

              {classDetail.tutor_description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Giới thiệu:</p>
                  <p className="text-gray-700">{classDetail.tutor_description}</p>
                </div>
              )}

              {classDetail.tutor_experience_years && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Kinh nghiệm:</p>
                  <p className="text-gray-700">{classDetail.tutor_experience_years} năm</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-blue-800">
                ℹ️ <strong>Chưa có gia sư</strong> - Hãy mời hoặc chờ gia sư ứng tuyển
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBackClick}>
            {' '}
            {/* ✅ SỬA */}← Quay lại
          </Button>
          {classDetail.status === 'recruiting' && <Button variant="default">📧 Mời Gia Sư</Button>}
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetailPage;

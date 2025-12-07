import React from 'react';
import { Star, MapPin, Check, X } from 'lucide-react';
import { TutorDetailForApproval } from '@/hooks/useApplications';

interface TutorDetailModalProps {
  tutor: TutorDetailForApproval['tutor'];
  schedules: TutorDetailForApproval['schedules'];
  classesTeaching: TutorDetailForApproval['classes_taught'];
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const TutorDetailModal: React.FC<TutorDetailModalProps> = ({
  tutor,
  schedules,
  classesTeaching,
  onApprove,
  onReject,
  onClose,
  isLoading,
}) => {
  const getDayName = (dayOfWeek: number): string => {
    const dayNames: Record<number, string> = {
      0: 'Chủ nhật',
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7',
    };
    return dayNames[dayOfWeek] || `Ngày ${dayOfWeek}`;
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{tutor.tutor_name}</h2>
            <p className="text-blue-100 text-sm mt-1">
              <MapPin className="w-3 h-3 inline mr-1" />
              {tutor?.ward_name}, {tutor?.district_name}, {tutor?.province_name}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-800 p-2 rounded transition">
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* BASIC INFO */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-6 border-b">
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Tuổi</p>
              <p className="font-medium">{calculateAge(tutor.tutor_dob)} tuổi</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Kinh nghiệm</p>
              <p className="font-medium">{tutor.experience_years || 0} năm</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Đánh giá</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{tutor.avg_rating?.toFixed(1) || 0}/5</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Số đánh giá</p>
              <p className="font-medium">{tutor.total_reviews || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
              <p className="text-sm text-blue-600">{tutor.tutor_email}</p>
            </div>
          </div>

          {/* BIO */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Giới thiệu</h3>
            <p className="text-sm text-gray-700">{tutor.bio || 'Không có'}</p>
          </div>

          {/* CURRENT SCHEDULES */}
          {schedules && schedules.length > 0 && (
            <div className="pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3">📅 Lịch dạy hiện tại</h3>
              <div className="space-y-2">
                {schedules.map((sch, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                    <span className="font-medium text-sm min-w-16 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {getDayName(sch.day_of_week)}
                    </span>
                    <span className="text-sm text-gray-700">
                      {formatTime(sch.start_time)} - {formatTime(sch.end_time)}
                    </span>
                    <span className="text-xs text-gray-600 ml-auto">{sch.subject_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLASSES TAUGHT */}
          {classesTeaching && classesTeaching.length > 0 && (
            <div className="pb-6 border-b">
              <h3 className="font-semibold text-gray-900 mb-3">📖 Các lớp đã dạy</h3>
              <div className="space-y-3">
                {classesTeaching.map((cls, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded">
                    <p className="font-medium text-sm">
                      {cls.subject_name} - Lớp {cls.gradeLevel}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{cls.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-700">
                          {cls.average_rating?.toFixed(1) || 0}/5 ({cls.total_reviews || 0} đánh
                          giá)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded hover:bg-gray-400 disabled:opacity-50 transition"
          >
            Quay lại
          </button>
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Từ chối
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorDetailModal;

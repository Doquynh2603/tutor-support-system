import React from 'react';
import { ChevronDown, ChevronUp, Star, MapPin, Mail, Phone, AlertCircle } from 'lucide-react';
import { Application } from '@/hooks/useApplications';

interface ApplicationTutorCardProps {
  app: Application;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewDetail: () => void;
  isLoading: boolean;
}

const ApplicationTutorCard: React.FC<ApplicationTutorCardProps> = ({
  app,
  isExpanded,
  onToggleExpand,
  onViewDetail,
  isLoading,
}) => {
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      applied: 'border-l-4 border-blue-500 bg-blue-50',
      invited: 'border-l-4 border-purple-500 bg-purple-50',
      approved: 'border-l-4 border-green-500 bg-green-50',
      rejected: 'border-l-4 border-red-500 bg-red-50',
    };
    return statusMap[status] || 'border-l-4 border-gray-500 bg-gray-50';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: '📋 Đã ứng tuyển',
      invited: '📧 Lời mời',
      approved: '✅ Đã duyệt',
      rejected: '❌ Từ chối',
    };
    return labels[status] || status;
  };

  return (
    <div
      className={`rounded-lg overflow-hidden transition shadow-sm hover:shadow-md ${getStatusColor(
        app.status
      )}`}
    >
      {/* HEADER */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-black hover:bg-opacity-5"
        onClick={onToggleExpand}
      >
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{app.tutor_name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {app.avg_rating?.toFixed(1) || 0} / 5.0
              {app.total_reviews && app.total_reviews > 0 && (
                <span className="text-gray-500">({app.total_reviews})</span>
              )}
            </span>
            <span className="flex items-center gap-1">📚 {app.experience_years || 0} năm</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-white bg-opacity-70 px-3 py-1 rounded">
            {getStatusLabel(app.status)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {isExpanded && (
        <div className="border-t border-gray-200 border-opacity-50 p-4 space-y-4">
          {/* INFO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Kinh nghiệm</p>
              <p className="font-medium">{app.experience_years || 0} năm</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Địa chỉ</p>
              <p className="font-medium text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {app?.ward_name || ''}, {app?.district_name || ''}, {app?.province_name || ''}
              </p>
            </div>
          </div>

          {/* BIO */}
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Giới thiệu</p>
            <p className="text-sm text-gray-700">{app.bio || 'Không có'}</p>
          </div>

          {/* SCHEDULE CONFLICT WARNING */}
          {app.schedule_conflict && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">⚠️ Lịch dạy bị trùng</p>
                <p className="text-xs text-red-700 mt-1">
                  Gia sư này có lịch dạy trùng với lớp học của bạn
                </p>
              </div>
            </div>
          )}

          {/* CONTACT INFO */}
          <div className="flex gap-4 py-3 border-t border-gray-200 border-opacity-50">
            <Mail className="w-4 h-4" />
            {app.tutor_email}
            <Phone className="w-4 h-4" />
            {app.tutor_phone}
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={onViewDetail}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            👁️ Xem chi tiết
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationTutorCard;

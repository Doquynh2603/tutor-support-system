import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Application } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';

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
    const statusMap: Record<string, { bg: string; border: string; dot: string }> = {
      applied: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
      invited: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
      approved: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
      rejected: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
    };
    return statusMap[status] || { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500' };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { icon: string; label: string }> = {
      applied: { icon: '📋', label: 'Đã ứng tuyển' },
      invited: { icon: '📧', label: 'Lời mời' },
      approved: { icon: '✅', label: 'Đã duyệt' },
      rejected: { icon: '❌', label: 'Từ chối' },
    };
    return labels[status] || { icon: '❓', label: status };
  };

  const colors = getStatusColor(app.status);
  const statusInfo = getStatusLabel(app.status);
  const genderDisplay =
    app.tutor_gender === true ? 'Nữ' : app.tutor_gender === false ? 'Nam' : 'Khác';

  return (
    <div
      className={`rounded-lg border-2 transition-all ${colors.border} ${colors.bg} overflow-hidden hover:shadow-md`}
    >
      {/* HEADER - Main Info */}
      <div className="p-4 space-y-3">
        {/* Top row: Name and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{app.tutor_name}</h3>
          </div>

          {/* Contact Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{app.tutor_phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{app.tutor_email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{genderDisplay}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              onClick={onViewDetail}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed py-2 h-auto"
            >
              👁️ Xem chi tiết gia sư
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTutorCard;

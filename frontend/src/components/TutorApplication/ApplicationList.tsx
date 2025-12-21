import { ApplicationListItem } from '@/types';
import ApplicationCard from './ApplicationCard';

interface ApplicationListProps {
  applications: ApplicationListItem[];
  expandedApplications: Set<string>;
  onToggleExpand: (applicationId: string) => void;
  onWithdraw: (applicationId: string) => void;
  onConfirm: (applicationId: string) => void;
  onDecline: (applicationId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function ApplicationList({
  applications,
  expandedApplications,
  onToggleExpand,
  onWithdraw,
  onConfirm,
  onDecline,
  isLoading,
  error,
}: ApplicationListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải đơn ứng tuyển...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        ❌ Lỗi: {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Không có đơn ứng tuyển nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application.application_id}
          application={application}
          isExpanded={expandedApplications.has(application.application_id)}
          onToggleExpand={onToggleExpand}
          onWithdraw={onWithdraw}
          onConfirm={onConfirm}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
}

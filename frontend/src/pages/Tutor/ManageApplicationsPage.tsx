import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationAPI } from '../../services/api';
import ApplicationTabs from '@/components/TutorApplication/ApplicationTabs'; // ✅ Sửa path nếu cần
import ApplicationList from '@/components/TutorApplication/ApplicationList'; // ✅ Sửa path nếu cần
import useSessionFilter from '@/hooks/useSessionFilter';

// ===============================
// TYPES
// ===============================
interface ManageApplicationsPageProps {
  onTabChange?: (tab: string) => void;
}
// Lịch học
export interface AppSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// Một đơn ứng tuyển
export interface Application {
  application_id: string;
  class_id: string;
  status:
    | 'invited'
    | 'applied'
    | 'approved'
    | 'withdrawn'
    | 'rejected'
    | 'class_cancelled'
    | 'cancel_invited';
  isConfirmed: boolean | null;
  declineReason: string | null;
  applied_date: string;
  withdrawReason: string | null;
  class_status: string;
  cancellation_reason: string | null;
  hourly_price: number | null;
  requirement: string | null;
  subject_name: string;
  classLevel: number;
  start_date: string;
  end_date: string;
  school: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_dob: string;
  student_age: number;
  gradeLevel: number;
  ward_name: string;
  district_name: string;
  province_name: string;
  schedules: AppSchedule[];
}

// API responses
export interface ApplicationListResponse {
  data: Application[];
}

export interface WithdrawRequest {
  applicationId: string;
  withdrawReason: string | null;
}

export interface ConfirmRequest {
  applicationId: string; // ✅ Sửa number → string
  isConfirmed: boolean;
  declineReason?: string | null;
}

// ===============================
// CONSTANTS
// ===============================

const STATUS_LABELS = {
  invited: { label: '💌 Được mời', color: 'purple' },
  applied: { label: '🎯 Đã ứng tuyển', color: 'blue' },
  approved: { label: '✅ Đã được duyệt', color: 'green' },
  withdrawn: { label: '🚫 Đã rút đơn', color: 'red' },
  rejected: { label: '❌ Bị từ chối', color: 'gray' },
  cancelled: { label: '🗑️ Lớp bị hủy', color: 'orange' },
} as const;

const STATUS_COLORS: Record<string, string> = {
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
};

// ✅ Tab mapping - gộp class_cancelled và cancel_invited thành 1 tab
type TabType = 'invited' | 'applied' | 'approved' | 'withdrawn' | 'rejected' | 'cancelled';

const TAB_STATUS_MAP: Record<TabType, string[]> = {
  invited: ['invited'],
  applied: ['applied'],
  approved: ['approved'],
  withdrawn: ['withdrawn'],
  rejected: ['rejected', 'invitation_cancelled'],
  cancelled: ['class_cancelled'],
};

// ===============================
// COMPONENT
// ===============================

const ManageApplicationsPage = ({ onTabChange }: ManageApplicationsPageProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('invited');

  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const queryClient = useQueryClient();
  useSessionFilter('targetTab', (value: string) => {
    if (['invited', 'applied', 'approved', 'withdrawn', 'rejected', 'cancelled'].includes(value)) {
      console.log('🔄 Đặt activeTab:', value);
      setActiveTab(value as TabType);
    }
  });

  // Reset modal states khi đổi tab
  useEffect(() => {
    setWithdrawingId(null);
    setWithdrawReason('');
    setConfirmingId(null);
    setDecliningId(null);
    setDeclineReason('');
    setExpandedApplications(new Set());
  }, [activeTab]);

  // ===============================
  // Fetch APPLICATIONS
  // ===============================
  const {
    data: applications = [],
    isLoading,
    error,
  } = useQuery<Application[]>({
    queryKey: ['applications', activeTab],
    queryFn: async () => {
      // ✅ Lấy tất cả status trong tab
      const statuses = TAB_STATUS_MAP[activeTab];

      let allApps: Application[] = [];

      for (const status of statuses) {
        try {
          const data = await applicationAPI.getMyApplications(status);
          allApps = [...allApps, ...(data ?? [])];
        } catch (error) {
          console.error(`Error fetching ${status}:`, error);
        }
      }

      return allApps as Application[];
    },
  });

  // ===============================
  // Rút đơn mutation
  // ===============================
  const withdrawMutation = useMutation({
    mutationFn: async (payload: WithdrawRequest) => {
      return await applicationAPI.withdrawApplication(
        payload.applicationId,
        payload.withdrawReason
      );
    },
    onSuccess: () => {
      alert('Rút đơn ứng tuyển thành công');
      setWithdrawingId(null);
      setWithdrawReason('');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Lỗi khi rút đơn ứng tuyển');
    },
  });

  // ===============================
  // Xác nhận / từ chối lớp
  // ===============================
  const confirmMutation = useMutation({
    mutationFn: async (payload: ConfirmRequest) => {
      return await applicationAPI.confirmApplication(
        payload.applicationId,
        payload.isConfirmed,
        payload.declineReason ?? null
      );
    },
    onSuccess: (_data, variables) => {
      alert(
        variables.isConfirmed ? '✅ Xác nhận lớp học thành công!' : '❌ Từ chối lớp học thành công!'
      );
      setConfirmingId(null);
      setDecliningId(null);
      setDeclineReason('');

      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Lỗi khi xác nhận/từ chối lớp học');
    },
  });

  // ===============================
  // Action handlers
  // ===============================

  const toggleExpand = (applicationId: string) => {
    setExpandedApplications((prev) => {
      const newSet = new Set(prev);
      newSet.has(applicationId) ? newSet.delete(applicationId) : newSet.add(applicationId);
      return newSet;
    });
  };
  const handleViewDetail = (classId: string, applicationId: string) => {
    if (onTabChange) {
      onTabChange('class-detail');
    }
  };
  const confirmWithdraw = () => {
    if (!withdrawingId) return;

    withdrawMutation.mutate({
      applicationId: withdrawingId,
      withdrawReason: withdrawReason || null,
    });
  };

  const confirmClass = () => {
    if (!confirmingId) return;
    confirmMutation.mutate({
      applicationId: confirmingId,
      isConfirmed: true,
    });
  };

  const declineClass = () => {
    if (!decliningId) return;
    if (!declineReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    confirmMutation.mutate({
      applicationId: decliningId,
      isConfirmed: false,
      declineReason: declineReason.trim(),
    });
  };

  // ===============================
  // TABS MAPPING
  // ===============================
  const tabs = [
    { key: 'invited' as TabType, label: STATUS_LABELS.invited.label },
    { key: 'applied' as TabType, label: STATUS_LABELS.applied.label },
    { key: 'approved' as TabType, label: STATUS_LABELS.approved.label },
    { key: 'withdrawn' as TabType, label: STATUS_LABELS.withdrawn.label },
    { key: 'rejected' as TabType, label: STATUS_LABELS.rejected.label },
    { key: 'cancelled' as TabType, label: STATUS_LABELS.cancelled.label },
  ];

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Quản lý đơn ứng tuyển</h1>
          <p className="text-gray-600">Xem và quản lý các đơn ứng tuyển của bạn</p>
        </div>

        {/* TABS */}
        <ApplicationTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

        {/* LIST */}
        <ApplicationList
          applications={applications}
          expandedApplications={expandedApplications}
          onToggleExpand={toggleExpand}
          onWithdraw={(id) => setWithdrawingId(id)}
          onConfirm={(id) => setConfirmingId(id)}
          onDecline={(id) => setDecliningId(id)}
          onViewDetail={handleViewDetail}
          isLoading={isLoading}
          error={error?.message || null}
        />

        {/* ===========================
            MODALS
        =========================== */}

        {/* Rút đơn */}
        {withdrawingId && (
          <ModalWithdraw
            reason={withdrawReason}
            onReasonChange={setWithdrawReason}
            onCancel={() => {
              setWithdrawingId(null);
              setWithdrawReason('');
            }}
            onConfirm={confirmWithdraw}
            isLoading={withdrawMutation.isPending}
          />
        )}

        {/* Xác nhận */}
        {confirmingId && (
          <ModalConfirmClass
            onCancel={() => setConfirmingId(null)}
            onConfirm={confirmClass}
            isLoading={confirmMutation.isPending}
          />
        )}

        {/* Từ chối */}
        {decliningId && (
          <ModalDecline
            reason={declineReason}
            onReasonChange={setDeclineReason}
            onCancel={() => {
              setDecliningId(null);
              setDeclineReason('');
            }}
            onConfirm={declineClass}
            isLoading={confirmMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default ManageApplicationsPage;

// =============================
// Separated Modal Components
// =============================

interface ModalWithdrawProps {
  reason: string;
  onReasonChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ModalWithdraw = ({
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
  isLoading,
}: ModalWithdrawProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-sm w-full p-6">
      <h2 className="text-xl font-bold mb-4">🚫 Xác nhận rút đơn</h2>

      <textarea
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="Lý do rút đơn (tuỳ chọn)"
      />

      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-4 py-2 border rounded" onClick={onCancel}>
          Hủy
        </button>

        <button
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Rút đơn'}
        </button>
      </div>
    </div>
  </div>
);

interface ModalConfirmClassProps {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ModalConfirmClass = ({ onCancel, onConfirm, isLoading }: ModalConfirmClassProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-sm w-full p-6">
      <h2 className="text-xl font-bold mb-4">✅ Xác nhận nhận lớp</h2>

      <p className="mb-4 text-gray-600">Bạn xác nhận nhận dạy lớp này?</p>

      <div className="flex gap-2">
        <button className="flex-1 border rounded px-4 py-2" onClick={onCancel}>
          Hủy
        </button>

        <button
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
      </div>
    </div>
  </div>
);

interface ModalDeclineProps {
  reason: string;
  onReasonChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ModalDecline = ({
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
  isLoading,
}: ModalDeclineProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-sm w-full p-6">
      <h2 className="text-xl font-bold mb-4">❌ Từ chối lớp học</h2>

      <textarea
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="Nhập lý do từ chối..."
      />

      <div className="flex gap-2 mt-4">
        <button className="flex-1 border rounded px-4 py-2" onClick={onCancel}>
          Hủy
        </button>

        <button
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          onClick={onConfirm}
          disabled={isLoading || !reason.trim()}
        >
          {isLoading ? 'Đang xử lý...' : 'Từ chối'}
        </button>
      </div>
    </div>
  </div>
);

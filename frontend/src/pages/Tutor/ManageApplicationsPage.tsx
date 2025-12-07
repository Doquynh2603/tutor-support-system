import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationAPI } from '../../services/api';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, XCircle, Check, X } from 'lucide-react';
import dayjs from 'dayjs';

// ===============================
// TYPES
// ===============================

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
  cancellation_reason: string | null; // ✅ Thêm
  hourly_price: number | null;
  requirement: string | null;
  subject_name: string;
  educationLevel: number;
  gradeLevel: number;
  school: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_dob: string;
  student_age: number;
  ward_name: string;
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
  applicationId: number;
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
  rejected: ['rejected'],
  cancelled: ['class_cancelled', 'cancel_invited'],
};

// ===============================
// COMPONENT
// ===============================

const ManageApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('invited');

  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const queryClient = useQueryClient();
  //chuyển đổi thứ
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
  // Helper functions
  // ===============================

  const getStatusColor = (status: string) => {
    if (status === 'class_cancelled' || status === 'cancel_invited') {
      return STATUS_COLORS['orange'];
    }
    return STATUS_COLORS[STATUS_LABELS[status as keyof typeof STATUS_LABELS]?.color || 'gray'];
  };

  const getStatusLabel = (status: string) => {
    if (status === 'class_cancelled' || status === 'cancel_invited') {
      return STATUS_LABELS.cancelled.label;
    }
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS]?.label || status;
  };

  // ===============================
  // TABS MAPPING
  // ===============================
  const tabs = [
    { id: 'invited' as TabType, label: STATUS_LABELS.invited.label },
    { id: 'applied' as TabType, label: STATUS_LABELS.applied.label },
    { id: 'approved' as TabType, label: STATUS_LABELS.approved.label },
    { id: 'withdrawn' as TabType, label: STATUS_LABELS.withdrawn.label },
    { id: 'rejected' as TabType, label: STATUS_LABELS.rejected.label },
    { id: 'cancelled' as TabType, label: STATUS_LABELS.cancelled.label },
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
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700">{(error as any)?.message || 'Lỗi khi tải dữ liệu'}</p>
          </div>
        )}

        {/* LIST APPLICATIONS */}
        {!isLoading && applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-2">Không có đơn ứng tuyển nào</p>
            <p className="text-gray-400 text-sm">Hãy tìm và ứng tuyển các lớp học để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className={`border rounded-lg overflow-hidden transition ${getStatusColor(app.status)}`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer flex items-center justify-between hover:opacity-80"
                  onClick={() => toggleExpand(app.application_id)}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{app.subject_name}</h3>
                    <p className="text-sm opacity-75">
                      Học viên: {app.student_name} - Lớp {app.gradeLevel}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-1 rounded">
                        {getStatusLabel(app.status)}
                      </span>

                      {app.isConfirmed === true && (
                        <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle size={12} /> Đã nhận lớp
                        </span>
                      )}

                      {app.isConfirmed === false && (
                        <span className="text-xs font-medium bg-red-200 text-red-800 px-2 py-1 rounded flex items-center gap-1">
                          <XCircle size={12} /> Đã từ chối
                        </span>
                      )}
                    </div>

                    {expandedApplications.has(app.application_id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {/* Expanded */}
                {expandedApplications.has(app.application_id) && (
                  <div className="border-t border-current border-opacity-20 p-4 bg-white bg-opacity-30">
                    {/* Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">Địa chỉ:</p>
                        <p className="text-sm">
                          {`${app.ward_name}, ${app.province_name}` || 'Không xác định'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">Giá/Giờ:</p>
                        <p className="text-sm font-semibold">{app.hourly_price}k VND</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold opacity-75 mb-1">Yêu cầu:</p>
                        <p className="text-sm">{app.requirement || 'Không có yêu cầu'}</p>
                      </div>

                      {app.withdrawReason && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold opacity-75 mb-1">Lý do rút:</p>
                          <p className="text-sm">{app.withdrawReason}</p>
                        </div>
                      )}

                      {/* ✅ Hiển thị lý do hủy lớp */}
                      {(app.status === 'class_cancelled' || app.status === 'cancel_invited') &&
                        app.cancellation_reason && (
                          <div className="col-span-2 bg-orange-100 border border-orange-300 rounded p-3">
                            <p className="text-xs font-semibold text-orange-800 mb-1">
                              🗑️ Lý do phụ huynh hủy lớp:
                            </p>
                            <p className="text-sm text-orange-700">{app.cancellation_reason}</p>
                          </div>
                        )}
                    </div>

                    {/* ✅ Hiển thị thông báo khi lớp bị hủy */}
                    {(app.status === 'class_cancelled' || app.status === 'cancel_invited') && (
                      <div className="col-span-2 mb-4 p-3 bg-orange-100 border border-orange-300 rounded">
                        <p className="text-xs font-semibold text-orange-800">
                          🗑️ Lớp học này đã bị phụ huynh hủy
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Trạng thái: {getStatusLabel(app.status)}
                        </p>
                      </div>
                    )}

                    {/* Schedules */}
                    {app.schedules && app.schedules.length > 0 && (
                      <div className="mb-4 border-t border-current border-opacity-20 pt-4">
                        <p className="text-xs font-semibold opacity-75 mb-2">Lịch học:</p>
                        <div className="space-y-2">
                          {app.schedules.map((sch: any, idx: number) => (
                            <div key={idx} className="text-sm flex items-center gap-2">
                              <span className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                                {getDayName(sch.day_of_week)}
                              </span>
                              <span>
                                {dayjs(sch.start_time).format('HH:mm')} -{' '}
                                {dayjs(sch.end_time).format('HH:mm')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 flex-wrap pt-4 border-t border-current border-opacity-20">
                      {/* Xác nhận lời mời (invited) */}
                      {app.status === 'invited' && app.isConfirmed === null && (
                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => setConfirmingId(app.application_id)}
                            className="flex-1 px-3 py-2 bg-green-500 text-gray-900 font-semibold rounded flex items-center justify-center gap-1"
                          >
                            <Check size={16} /> Đồng ý tham gia
                          </button>

                          <button
                            onClick={() => setDecliningId(app.application_id)}
                            className="flex-1 px-3 py-2 bg-orange-500 text-gray-900 font-semibold rounded flex items-center justify-center gap-1"
                          >
                            <X size={16} /> Từ chối
                          </button>

                          <button
                            onClick={() => setWithdrawingId(app.application_id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-gray-900 font-semibold rounded"
                          >
                            🚫 Rút đơn
                          </button>
                        </div>
                      )}

                      {/* Rút đơn */}
                      {(app.status === 'invited' ||
                        app.status === 'applied' ||
                        app.status === 'approved') &&
                        app.isConfirmed !== true && (
                          <button
                            onClick={() => setWithdrawingId(app.application_id)}
                            className="w-full px-3 py-2 bg-red-500 text-gray-900 font-semibold rounded"
                            disabled={withdrawMutation.isPending}
                          >
                            🚫 Rút đơn
                          </button>
                        )}

                      {/* Xác nhận / Từ chối */}
                      {app.status === 'approved' && app.isConfirmed === null && (
                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => setConfirmingId(app.application_id)}
                            className="flex-1 px-3 py-2 bg-green-500 text-gray-900 font-semibold rounded flex items-center justify-center gap-1"
                          >
                            <Check size={16} /> Nhận lớp
                          </button>

                          <button
                            onClick={() => setDecliningId(app.application_id)}
                            className="flex-1 px-3 py-2 bg-orange-500 text-gray-900 font-semibold rounded flex items-center justify-center gap-1"
                          >
                            <X size={16} /> Từ chối
                          </button>

                          <button
                            onClick={() => setWithdrawingId(app.application_id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-gray-900 font-semibold rounded"
                          >
                            🚫 Rút đơn
                          </button>
                        </div>
                      )}

                      {/* Confirmed badge */}
                      {app.isConfirmed === true && (
                        <div className="w-full px-3 py-2 bg-green-100 text-green-700 rounded text-sm text-center flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> Đã xác nhận nhận lớp
                        </div>
                      )}

                      {app.isConfirmed === false && (
                        <div className="w-full">
                          <div className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm text-center flex items-center justify-center gap-2">
                            <XCircle size={16} /> Đã từ chối lớp
                          </div>
                          {app.declineReason && (
                            <p className="text-xs text-red-600 mt-2 italic">
                              Lý do: {app.declineReason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* ✅ Disabled state khi lớp bị hủy */}
                      {(app.status === 'class_cancelled' || app.status === 'cancel_invited') && (
                        <div className="w-full px-3 py-2 bg-orange-100 text-orange-700 rounded text-sm text-center font-medium">
                          🗑️ Lớp học này đã bị hủy
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Loader } from 'lucide-react';
import { useApplications, Application, TutorDetailForApproval } from '@/hooks/useApplications';
import ApplicationTutorCard from '@/components/Student/ApplicationTutorCard';
import TutorDetailModal from '@/components/Student/TutorDetailModal';

interface ViewTutorsPageProps {
  onTabChange?: (tab: string) => void; // ✅ THÊM
}
const ViewTutorsPage: React.FC<ViewTutorsPageProps> = ({ onTabChange }) => {
  const classId = sessionStorage.getItem('currentClassId');

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);
  const [selectedTutorDetail, setSelectedTutorDetail] = useState<TutorDetailForApproval | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ✅ THÊM STATE CHO REJECT DIALOG
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingApplicationId, setRejectingApplicationId] = useState<string | null>(null);

  const { getApplicationsByClass, getTutorDetail, reviewApplication, loading, error } =
    useApplications();

  // ✅ Load danh sách gia sư khi trang vào
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!classId) {
          alert('❌ Không tìm thấy ID lớp học');
          handleBackToClasses();
          return;
        }
        const data = await getApplicationsByClass(classId);
        setApplications(data);
        setFilteredApplications(data);
      } catch (error) {
        console.error('Error loading applications:', error);
        alert('❌ Lỗi khi tải danh sách gia sư. Vui lòng thử lại!');
      }
    };

    fetchApplications();
  }, [classId]);
  const handleBackToClasses = () => {
    sessionStorage.removeItem('currentClassId');
    if (onTabChange) {
      onTabChange('my-classes');
    }
  };
  // ✅ Lọc lịch trùng
  const handleFilterSchedule = () => {
    if (showScheduleFilter) {
      setFilteredApplications(applications);
      setShowScheduleFilter(false);
    } else {
      const filtered = applications.filter((app) => !app.schedule_conflict);
      setFilteredApplications(filtered);
      setShowScheduleFilter(true);
    }
  };

  // ✅ Xem chi tiết gia sư
  const handleViewDetail = async (tutorId: string) => {
    try {
      console.log('👁️ handleViewDetail called:', { tutorId, classId }); // ✅ Log
      if (!classId) {
        console.error('❌ classId is missing!');
        alert('❌ Lỗi: Không tìm thấy ID lớp học');
        return;
      }

      if (!tutorId) {
        console.error('❌ tutorId is missing!');
        alert('❌ Lỗi: Không tìm thấy ID gia sư');
        return;
      }

      console.log('📞 Calling getTutorDetail with:', { tutorId, classId });
      const detail = await getTutorDetail(tutorId, classId);
      setSelectedTutorDetail(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading tutor detail:', error);
      alert('❌ Lỗi khi tải chi tiết gia sư');
    }
  };

  // ✅ Duyệt gia sư
  const handleApprove = async (applicationId: string) => {
    const confirmed = window.confirm('Bạn chắc chắn muốn duyệt gia sư này?');
    if (!confirmed) return;

    try {
      await reviewApplication(applicationId, 'approve');
      alert('✅ Duyệt gia sư thành công!');
      setShowDetailModal(false);

      // Reload danh sách
      if (classId) {
        const data = await getApplicationsByClass(classId);
        setApplications(data);
        setFilteredApplications(data);
      }
    } catch (error) {
      console.error('Error approving tutor:', error);
      alert(`❌ Lỗi khi duyệt gia sư: ${error}`);
    }
  };

  // ✅ SỬA: Từ chối gia sư - Mở dialog thay vì prompt
  const handleReject = (applicationId: string) => {
    setRejectingApplicationId(applicationId);
    setRejectReason(''); // Reset reason
    setShowRejectDialog(true);
  };

  // ✅ THÊM: Xử lý submit reject dialog
  const handleRejectSubmit = async () => {
    if (rejectReason.trim() === '') {
      alert('⚠️ Vui lòng nhập lý do từ chối');
      return;
    }

    if (!rejectingApplicationId) return;

    try {
      await reviewApplication(rejectingApplicationId, 'reject', rejectReason);
      alert('✅ Từ chối gia sư thành công!');
      setShowRejectDialog(false);
      setShowDetailModal(false);

      // Reload danh sách
      if (classId) {
        const data = await getApplicationsByClass(classId);
        setApplications(data);
        setFilteredApplications(data);
      }
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      alert(`❌ Lỗi khi từ chối gia sư: ${error}`);
    }
  };

  // ✅ THÊM: Cancel reject dialog
  const handleRejectCancel = () => {
    setShowRejectDialog(false);
    setRejectReason('');
    setRejectingApplicationId(null);
  };

  // ✅ Tìm application dựa trên tutor id
  const getApplicationByTutorId = (tutorId: string) => {
    return applications.find((a) => a.tutor_id === tutorId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ========== HEADER ========== */}
        <div className="mb-8">
          <button
            onClick={handleBackToClasses}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1 text-sm font-medium"
          >
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍🏫 Danh sách gia sư ứng tuyển</h1>
          <p className="text-gray-600">Chọn gia sư phù hợp cho lớp học của bạn</p>
        </div>

        {/* ========== ERROR MESSAGE ========== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {/* ========== FILTER SECTION ========== */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={handleFilterSchedule}
            className={`px-4 py-2 rounded font-medium flex items-center gap-2 transition ${
              showScheduleFilter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            <Calendar className="w-4 h-4" />
            {showScheduleFilter ? '🔄 Bỏ lọc lịch' : '🔍 Lọc lịch rảnh'}
          </button>

          {showScheduleFilter && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              ✅ Đang hiển thị {filteredApplications.length} gia sư có lịch phù hợp
            </div>
          )}
        </div>

        {/* ========== LOADING STATE ========== */}
        {loading && applications.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Đang tải danh sách...</span>
          </div>
        )}

        {/* ========== EMPTY STATE ========== */}
        {!loading && filteredApplications.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {applications.length === 0
                ? '📭 Chưa có gia sư nào ứng tuyển'
                : '🔍 Không có gia sư có lịch phù hợp'}
            </p>
            <button
              onClick={handleBackToClasses}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Quay lại
            </button>
          </div>
        )}

        {/* ========== TUTORS LIST ========== */}
        {filteredApplications.length > 0 && (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <ApplicationTutorCard
                key={app.application_id}
                app={app}
                isExpanded={expandedTutorId === app.tutor_id}
                onToggleExpand={() =>
                  setExpandedTutorId(expandedTutorId === app.tutor_id ? null : app.tutor_id)
                }
                onViewDetail={() => handleViewDetail(app.tutor_id)}
                isLoading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========== DETAIL MODAL ========== */}
      {showDetailModal && selectedTutorDetail && (
        <TutorDetailModal
          tutor={selectedTutorDetail.tutor}
          schedules={selectedTutorDetail.schedules}
          classesTeaching={selectedTutorDetail.classes_taught}
          onApprove={() => {
            const app = getApplicationByTutorId(selectedTutorDetail.tutor.user_id);
            if (app) handleApprove(app.application_id);
          }}
          onReject={() => {
            const app = getApplicationByTutorId(selectedTutorDetail.tutor.user_id);
            if (app) handleReject(app.application_id);
          }}
          onClose={() => setShowDetailModal(false)}
          isLoading={loading}
        />
      )}

      {/* ========== REJECT DIALOG MODAL ========== */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Từ chối gia sư</h3>
            <p className="text-gray-600 mb-4">Vui lòng nhập lý do từ chối:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRejectCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTutorsPage;

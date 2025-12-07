import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Loader } from 'lucide-react';
import { useApplications, Application, TutorDetailForApproval } from '@/hooks/useApplications';
import ApplicationTutorCard from '@/components/Student/ApplicationTutorCard';
import TutorDetailModal from '@/components/Student/TutorDetailModal';
import { log } from 'console';

const ViewTutorsPage: React.FC = () => {
  const classId = sessionStorage.getItem('currentClassId');
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);
  const [selectedTutorDetail, setSelectedTutorDetail] = useState<TutorDetailForApproval | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { getApplicationsByClass, getTutorDetail, reviewApplication, loading, error } =
    useApplications();

  // ✅ Load danh sách gia sư khi trang vào
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!classId) {
          alert('❌ Không tìm thấy ID lớp học');
          navigate(-1);
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
  }, [classId, navigate]);

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

  // ✅ Từ chối gia sư
  const handleReject = async (applicationId: string) => {
    const reason = prompt('📝 Nhập lý do từ chối:');
    if (reason === null) {
      return;
    }

    if (reason.trim() === '') {
      alert('⚠️ Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await reviewApplication(applicationId, 'reject', reason);
      alert('✅ Từ chối gia sư thành công!');
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
  console.log('đơn ứng tuyển lấy được từ backend', applications);
  console.log('thông tin gia sư được chọn lấy từ backend', selectedTutorDetail);

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
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1 text-sm font-medium"
          >
            ← Quay lại
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
              onClick={() => navigate(-1)}
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
    </div>
  );
};

export default ViewTutorsPage;

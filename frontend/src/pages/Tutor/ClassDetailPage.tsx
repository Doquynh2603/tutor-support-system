import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Mail,
  Phone,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearClasses, fetchAllRecruitingClasses } from '../../store/slices/classesSlice';

// ===============================
// Types
// ===============================

// Schedule for class
export interface ClassSchedule {
  schedule_id: number | string;
  day_of_week: number; // 1..7
  start_time: string;
  end_time: string;
  start_date: string;
}

// Class detail response from backend
export interface ClassDetail {
  class_id: number | string;
  subject_name: string;
  subject_desc?: string;

  hourly_price: number;

  educationLevel: number;
  gradeLevel: number;

  school?: string;
  ward_name?: string;

  requirement?: string;

  student_name: string;
  student_age: number;
  student_email: string;
  student_phone: string;

  schedules: ClassSchedule[];
}

// Apply Mutation Response
export interface ApplyResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface RouteParams {
  classId?: string;
}

// ===============================
// Constants
// ===============================

const API_URL = 'http://localhost:5000/api';

const DAY_NAMES: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
};

// ===============================
// Component
// ===============================

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { classId } = useParams<RouteParams>();
  const [showModal, setShowModal] = useState(false);

  // ======= Fetch Class Detail =======
  const { data: classDetail, isLoading } = useQuery<ClassDetail>({
    queryKey: ['classDetail', classId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/search/classes/${classId}`);
      console.log('📦 Class detail from DB:', res.data.data);
      return res.data.data as ClassDetail;
    },
    enabled: Boolean(classId),
  });

  // ======= Apply to class =======
  const applyMutation = useMutation<ApplyResponse>({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/search/classes/${classId}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('📩 Apply data from backend:', res.data);
      return res.data as ApplyResponse;
    },
    onSuccess: () => {
      alert('Ứng tuyển lớp thành công!');
      setShowModal(false);

      dispatch(clearClasses());

      // Force refetch
      setTimeout(() => {
        dispatch(fetchAllRecruitingClasses());
      }, 100);

      navigate('/');
    },
    onError: (error: any) => {
      alert(`Ứng tuyển lớp thất bại: ${error?.response?.data?.message || 'Lỗi'}`);
    },
  });

  // ===============================
  // Loading & Not found
  // ===============================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!classDetail) {
    return <div className="text-center py-12">Lớp không tồn tại</div>;
  }

  // ===============================
  // UI Rendering
  // ===============================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />← Quay lại
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-blue-600">{classDetail.subject_name}</h1>
              <p className="text-gray-600 mt-2">{classDetail.subject_desc}</p>
            </div>

            <div className="text-right bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Giá dạy</div>
              <div className="text-3xl font-bold text-yellow-600">{classDetail.hourly_price}k</div>
              <div className="text-xs text-gray-500">VND/giờ</div>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-600">Cấp độ</p>
              <p className="font-semibold">
                {classDetail.educationLevel === 12 ? 'Cấp 3' : 'Cấp 2'}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-600">Lớp</p>
              <p className="font-semibold">Lớp {classDetail.gradeLevel}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm text-gray-600">Trường</p>
              <p className="font-semibold truncate">{classDetail.school}</p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm text-gray-600">Địa điểm</p>
              <p className="font-semibold truncate">{classDetail.ward_name}</p>
            </div>
          </div>
        </div>

        {/* Requirement */}
        {classDetail.requirement && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Yêu cầu từ phụ huynh:</h3>
            <p className="text-blue-800">{classDetail.requirement}</p>
          </div>
        )}

        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Thông tin học viên
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Tên</p>
              <p className="text-lg font-semibold">{classDetail.student_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tuổi</p>
              <p className="text-lg font-semibold">{classDetail.student_age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="w-4 h-4 mr-1" /> Email
              </p>
              <p className="text-lg font-semibold">{classDetail.student_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center">
                <Phone className="w-4 h-4 mr-1" /> Điện thoại
              </p>
              <p className="text-lg font-semibold">{classDetail.student_phone}</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        {classDetail.schedules?.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-green-600" />
              Lịch học
            </h2>

            <div className="space-y-3">
              {classDetail.schedules.map((sch) => (
                <div
                  key={sch.schedule_id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded border border-green-200"
                >
                  <span className="font-semibold text-green-700">{DAY_NAMES[sch.day_of_week]}</span>
                  <span>
                    {sch.start_time} - {sch.end_time}
                  </span>
                  <span className="text-sm text-gray-500">
                    Từ {new Date(sch.start_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Button
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowModal(true)}
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              '✈️ Ứng tuyển lớp này'
            )}
          </Button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm">
              <h3 className="text-2xl font-bold mb-4">Xác nhận ứng tuyển</h3>
              <p className="text-gray-600 mb-6">
                Bạn muốn ứng tuyển <strong>{classDetail.subject_name}</strong> của{' '}
                <strong>{classDetail.student_name}</strong>?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button
                  onClick={() => applyMutation.mutate()}
                  className="flex-1"
                  disabled={applyMutation.isPending}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

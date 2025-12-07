import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  fetchAllRecruitingClasses,
  filterClasses,
  resetFilters,
  selectFilteredClasses,
  selectClassesLoading,
  selectClassesError,
} from '../../store/slices/classesSlice';
import { useProvinces } from '../../hooks/useProvinces';
import { useSubjects } from '../../hooks/useSubjects';
import DevNavigation from '../../components/DevNavigation';
import { AppDispatch } from '../../store';
interface Province {
  id: string | number;
  name: string;
}
interface Subject {
  id: string | number;
  name: string;
}

interface Filters {
  province_id: string;
  subject_id: string;
  gradeLevel: string;
  educationLevel: string;
  minRate: number;
  maxRate: number;
}

export default function SearchPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux store - classes
  const classesLoading = useSelector(selectClassesLoading) as boolean;
  const classesError = useSelector(selectClassesError) as string | null;

  // React Query - provinces & subjects
  const { data: provinces = [], isLoading: provincesLoading } = useProvinces(true);
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects(true);

  const [localFilters, setLocalFilters] = useState<Filters>({
    province_id: '',
    subject_id: '',
    gradeLevel: '',
    educationLevel: '',
    minRate: 0,
    maxRate: 999999,
  });

  const filteredClasses = useSelector(selectFilteredClasses);

  useEffect(() => {
    dispatch(fetchAllRecruitingClasses());
  }, [dispatch]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);

    dispatch(
      filterClasses({
        [name]: name.includes('Rate') ? Number(value) : value,
      })
    );
  };

  const handleResetFilters = () => {
    const reset: Filters = {
      province_id: '',
      subject_id: '',
      gradeLevel: '',
      educationLevel: '',
      minRate: 0,
      maxRate: 999999,
    };
    setLocalFilters(reset);
    dispatch(resetFilters());
  };

  const handleClassClick = (class_id: string | number) => {
    navigate(`/search/classes/${class_id}`);
  };

  const handleApplyClass = (classId: string | number) => {
    console.log('Apply for class:', classId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DevNavigation />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tìm Lớp</h1>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bộ lọc</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Province Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành</label>
              <select
                name="province_id"
                value={localFilters.province_id}
                onChange={handleFilterChange}
                disabled={provincesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn tỉnh/thành --</option>
                {provinces.map((p: Province, index) => (
                  <option key={p.id || index} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
              <select
                name="subject_id"
                value={localFilters.subject_id}
                onChange={handleFilterChange}
                disabled={subjectsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((s: Subject, index) => (
                  <option key={s.id || index} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khối lớp</label>
              <select
                name="gradeLevel"
                value={localFilters.gradeLevel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option key="" value="">-- Chọn khối lớp --</option>
                <option key="primary" value="primary">Tiểu học</option>
                <option key="secondary" value="secondary">Trung học cơ sở</option>
                <option key="high" value="high">Trung học phổ thông</option>
                <option key="university" value="university">Đại học</option>
              </select>
            </div>

            {/* Education Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trình độ học vấn
              </label>
              <select
                name="educationLevel"
                value={localFilters.educationLevel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option key="" value="">-- Chọn trình độ --</option>
                <option key="high_school" value="high_school">Tốt nghiệp THPT</option>
                <option key="bachelor" value="bachelor">Cử nhân</option>
                <option key="master" value="master">Thạc sĩ</option>
                <option key="phd" value="phd">Tiến sĩ</option>
              </select>
            </div>

            {/* Min Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá tối thiểu (VNĐ/giờ)
              </label>
              <input
                type="number"
                name="minRate"
                value={localFilters.minRate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá tối đa (VNĐ/giờ)
              </label>
              <input
                type="number"
                name="maxRate"
                value={localFilters.maxRate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4">
            <Button onClick={handleResetFilters} className="flex-1">
              Reset bộ lọc
            </Button>
          </div>
        </div>

        {/* Loading */}
        {classesLoading && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin w-8 h-8 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600">Đang tải lớp...</p>
          </div>
        )}

        {/* Error */}
        {classesError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ❌ Lỗi: {classesError}
          </div>
        )}

        {/* Classes List */}
        {!classesLoading && (
          <div>
            <p className="text-gray-600 mb-4">
              Tìm thấy <strong>{filteredClasses.length}</strong> lớp
            </p>

            {filteredClasses.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-6 rounded text-center">
                ⚠️ Không tìm thấy lớp phù hợp
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls, index) => (
                  <Card key={cls.class_id || index} className="relative">
                    <CardHeader>
                      <CardTitle>
                        {cls.subject_name} lớp {cls.gradeLevel}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>📍 {cls.student_location || 'Không xác định'}</p>
                        <p>💰 {cls.hourly_price?.toLocaleString()} VNĐ/giờ</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleClassClick(cls.class_id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          onClick={() => handleApplyClass(cls.class_id)}
                          disabled={cls.application_status === 'applied'}
                          className={`flex-1 ${
                            cls.application_status === 'applied'
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {cls.application_status === 'applied' ? '✓ Đã ứng tuyển' : 'Ứng tuyển'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

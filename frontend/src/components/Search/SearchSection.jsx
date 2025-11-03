/**
 * File: components/Search/SearchSection.jsx
 * Mục đích: Component tìm kiếm lớp học (có thể dùng ở HomePage)
 * Vai trò: Hiển thị form filter + kết quả search (Lazy load data, search on click)
 */

import React, { useState } from 'react';
import { useSearchClasses, useSubjects, useApplyForClass } from '../../hooks/useSearchClasses';
import { useProvinces, useWardsByProvince } from '../../hooks/useTutorProfile';
import { LoadingSpinner, ErrorAlert } from '../ui';

const SearchSection = () => {
  // Filter states
  const [filters, setFilters] = useState({
    subjectId: '',
    provinceId: '',
    wardId: '',
    minWage: '',
    maxWage: '',
    gradeLevel: '',
    educationLevel: '',
  });

  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [introduction, setIntroduction] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Lazy load: Chỉ fetch khi người dùng click/focus vào select
  const [loadData, setLoadData] = useState({
    subjects: false,
    provinces: false,
  });

  console.log('🔍 SearchSection DEBUG:', {
    loadData,
    loadDataSubjectsType: typeof loadData.subjects,
    loadDataProvincesType: typeof loadData.provinces,
    enabledSubjects: !!loadData.subjects,
    enabledProvinces: !!loadData.provinces,
  });

  // Chỉ fetch khi loadData = true (lazy load) - convert sang boolean rõ ràng
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects(!!loadData.subjects);
  const { data: provinces = [], isLoading: provincesLoading } = useProvinces(!!loadData.provinces);
  const { data: wards = [], isLoading: wardsLoading } = useWardsByProvince(
    selectedProvinceId,
    !!selectedProvinceId
  );
  const { mutate: applyForClass, isPending: submitting } = useApplyForClass();

  // Search with filters - chỉ search khi có ít nhất 1 filter
  const hasActiveFilters =
    filters.subjectId ||
    filters.provinceId ||
    filters.wardId ||
    filters.minWage ||
    filters.maxWage ||
    filters.gradeLevel ||
    filters.educationLevel;

  const searchFilters = {
    status: 'recruiting',
    subject_id: filters.subjectId ? parseInt(filters.subjectId) : undefined,
    province_id: filters.provinceId ? parseInt(filters.provinceId) : undefined,
    ward_id: filters.wardId ? parseInt(filters.wardId) : undefined,
    min_wage: filters.minWage ? parseInt(filters.minWage) : undefined,
    max_wage: filters.maxWage ? parseInt(filters.maxWage) : undefined,
    grade_level: filters.gradeLevel || undefined,
    education_level: filters.educationLevel || undefined,
  };

  // Remove undefined values
  Object.keys(searchFilters).forEach(
    (key) => searchFilters[key] === undefined && delete searchFilters[key]
  );

  // State để trigger search khi user click nút
  const [shouldSearch, setShouldSearch] = useState(false);

  // Chỉ search khi shouldSearch = true VÀ có active filters
  const {
    data: searchResults = [],
    isLoading: searchLoading,
    error: searchError,
  } = useSearchClasses(searchFilters, shouldSearch && hasActiveFilters);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle province change (cascading)
  const handleProvinceChange = (e) => {
    const provinceId = parseInt(e.target.value) || null;
    setSelectedProvinceId(provinceId);
    setFilters((prev) => ({
      ...prev,
      provinceId: provinceId,
      wardId: '', // Reset ward
    }));
  };

  // Lazy load: Trigger fetch khi focus vào select
  const handleSelectFocus = (type) => {
    setLoadData((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  // Handle apply
  const handleApply = (classItem) => {
    setSelectedClass(classItem);
    setShowDetail(true);
    setIntroduction('');
  };

  // Handle submit application
  const handleSubmitApplication = () => {
    if (!introduction.trim() || introduction.length < 20) {
      alert('Vui lòng nhập lời giới thiệu ít nhất 20 ký tự');
      return;
    }

    applyForClass(
      {
        classId: selectedClass.id,
        introduction: introduction.trim(),
      },
      {
        onSuccess: () => {
          setShowDetail(false);
          setSelectedClass(null);
          setIntroduction('');
          alert('Ứng tuyển thành công!');
        },
      }
    );
  };

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">🔍 Tìm Kiếm Lớp Dạy</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-lg mb-6">
          {/* Subject - Lazy Load */}
          <select
            name="subjectId"
            value={filters.subjectId}
            onChange={handleFilterChange}
            onFocus={() => handleSelectFocus('subjects')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📚 Tất Cả Môn Học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {/* Province - Lazy Load */}
          <select
            name="provinceId"
            value={filters.provinceId}
            onChange={handleProvinceChange}
            onFocus={() => handleSelectFocus('provinces')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📍 Tất Cả Tỉnh</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>

          {/* Ward */}
          <select
            name="wardId"
            value={filters.wardId}
            onChange={handleFilterChange}
            disabled={!selectedProvinceId}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">🏘️ Tất Cả Huyện</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>

          {/* Min Wage */}
          <input
            type="number"
            name="minWage"
            value={filters.minWage}
            onChange={handleFilterChange}
            placeholder="💰 Min Lương"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Search Button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShouldSearch(true)}
            disabled={!hasActiveFilters || searchLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-2 rounded-lg transition font-semibold"
          >
            {searchLoading ? '⏳ Đang Tìm Kiếm...' : '🔍 Tìm Kiếm'}
          </button>
          <button
            onClick={() => {
              setFilters({
                subjectId: '',
                provinceId: '',
                wardId: '',
                minWage: '',
                maxWage: '',
                gradeLevel: '',
                educationLevel: '',
              });
              setShouldSearch(false);
              setSelectedProvinceId(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-2 rounded-lg transition font-semibold"
          >
            ↺ Đặt Lại
          </button>
        </div>

        {/* Results */}
        {searchLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Đang tìm kiếm..." />
          </div>
        )}

        {searchError && <ErrorAlert title="Lỗi" message="Không thể tải danh sách lớp" />}

        {!searchLoading && searchResults.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Không tìm thấy lớp phù hợp</p>
          </div>
        )}

        {/* Results Grid */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-500 p-4"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{classItem.class_name}</h3>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {classItem.subject_name}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {classItem.grade_level}
                  </span>
                </div>
                <p className="text-green-600 font-bold mb-2">
                  {(classItem.wage_per_session || 0).toLocaleString('vi-VN')}đ/buổi
                </p>
                <p className="text-gray-600 text-sm mb-3">{classItem.location_display}</p>
                <button
                  onClick={() => handleApply(classItem)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                >
                  Xem Chi Tiết & Ứng Tuyển
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-start sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">{selectedClass.class_name}</h2>
                <p className="text-blue-100">{selectedClass.subject_name}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-2xl hover:text-gray-200">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Mức Lương</p>
                <p className="text-2xl font-bold text-green-600">
                  {(selectedClass.wage_per_session || 0).toLocaleString('vi-VN')}đ/buổi
                </p>
              </div>

              {selectedClass.description && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Mô Tả</h4>
                  <p className="text-gray-700">{selectedClass.description}</p>
                </div>
              )}

              {selectedClass.schedule_info && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Lịch Dạy</h4>
                  <div className="space-y-2">
                    {(typeof selectedClass.schedule_info === 'string'
                      ? JSON.parse(selectedClass.schedule_info)
                      : selectedClass.schedule_info
                    )
                      .slice(0, 3)
                      .map((schedule, idx) => (
                        <p key={idx} className="text-gray-600 bg-gray-50 p-2 rounded text-sm">
                          {dayNames[schedule.day_of_week]} {schedule.start_time} -{' '}
                          {schedule.end_time}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {/* Application Form */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Lời Giới Thiệu</h4>
                <textarea
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Giới thiệu bản thân, kinh nghiệm dạy học..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                />
                <p className="text-sm text-gray-500 mt-1">{introduction.length}/2000</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition font-semibold"
                >
                  {submitting ? '⏳ Đang Gửi...' : '📤 Ứng Tuyển'}
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;

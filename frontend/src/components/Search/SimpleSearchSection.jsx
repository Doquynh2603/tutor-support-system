/**
 * File: components/Search/SimpleSearchSection.jsx
 * Mục đích: Component tìm kiếm lớp học đơn giản
 * Vai trò: Hiển thị form filter + kết quả search
 * KHÔNG có lazy load để tránh lỗi React Query
 */

import React, { useState } from 'react';
import { useSearchClasses, useSubjects, useApplyForClass } from '../../hooks/useSearchClasses';
import { useProvinces } from '../../hooks/useTutorProfile';
import { useQuery } from '@tanstack/react-query';
import { locationAPI } from '../../services/api';

const SimpleSearchSection = () => {
  // Filter states
  const [filters, setFilters] = useState({
    subjectId: '',
    provinceId: '',
    wardId: '',
    minWage: '',
    maxWage: '',
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [introduction, setIntroduction] = useState('');

  // ✅ Fetch dữ liệu luôn (KHÔNG lazy load)
  const { data: subjects = [] } = useSubjects(true);
  const { data: provinces = [] } = useProvinces(true);

  // ✅ Ward hook - simplified to avoid React Query issues
  const { data: wards = [] } = useQuery({
    queryKey: ['wards', filters.provinceId],
    queryFn: async () => {
      if (!filters.provinceId) return [];
      try {
        const response = await locationAPI.getWardsByProvince(filters.provinceId);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching wards:', error);
        return [];
      }
    },
    enabled: Boolean(filters.provinceId), // ✅ STRICT BOOLEAN
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const { mutate: applyForClass, isPending: submitting } = useApplyForClass();

  // ✅ Chỉ search khi user click nút
  const [shouldSearch, setShouldSearch] = useState(false);

  const searchFilters = {
    status: 'recruiting',
    // Chỉ add filter nếu có value, nếu không thì undefined (sẽ bị xóa)
    subject_id: filters.subjectId ? parseInt(filters.subjectId) : undefined,
    province_id: filters.provinceId ? parseInt(filters.provinceId) : undefined,
    ward_id: filters.wardId ? parseInt(filters.wardId) : undefined,
    min_wage: filters.minWage ? parseInt(filters.minWage) : undefined,
    max_wage: filters.maxWage ? parseInt(filters.maxWage) : undefined,
  };

  // Remove undefined values
  Object.keys(searchFilters).forEach(
    (key) => searchFilters[key] === undefined && delete searchFilters[key]
  );

  // ✅ Search khi shouldSearch = true (ngay cả khi không có filter)
  const {
    data: searchResults = [],
    isLoading: searchLoading,
    error: searchError,
  } = useSearchClasses(
    searchFilters,
    shouldSearch // ← Không cần hasFilters condition nữa
  );

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'provinceId' && { wardId: '' }), // Reset ward when province changes
    }));
  };

  const handleSearch = () => {
    // ✅ Cho phép search mà không có filter (sẽ hiển thị tất cả lớp)
    setShouldSearch(true);
  };

  const handleApply = (classItem) => {
    setSelectedClass(classItem);
    setShowDetail(true);
  };

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
          alert('✅ Ứng tuyển thành công!');
        },
      }
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🔍 Tìm Kiếm Lớp Dạy</h2>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Môn Học</label>
            <select
              name="subjectId"
              value={filters.subjectId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành Phố</label>
            <select
              name="provinceId"
              value={filters.provinceId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn tỉnh --</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
            <select
              name="wardId"
              value={filters.wardId}
              onChange={handleFilterChange}
              disabled={!filters.provinceId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">-- Chọn quận --</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Min Wage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lương Tối Thiểu (đ)
            </label>
            <input
              type="number"
              name="minWage"
              value={filters.minWage}
              onChange={handleFilterChange}
              placeholder="Lương tối thiểu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Wage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lương Tối Đa (đ)</label>
            <input
              type="number"
              name="maxWage"
              value={filters.maxWage}
              onChange={handleFilterChange}
              placeholder="Lương tối đa"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition"
        >
          {searchLoading ? '⏳ Đang tìm kiếm...' : '🔍 Tìm Kiếm'}
        </button>
      </div>

      {/* Error Message */}
      {searchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ Lỗi: {searchError.message}
        </div>
      )}

      {/* Search Results */}
      {shouldSearch && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📚 Kết quả tìm kiếm ({searchResults.length} lớp)
          </h3>

          {searchResults.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">😞 Không tìm thấy lớp học nào phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                >
                  <h4 className="font-bold text-lg mb-2">{classItem.subject_name}</h4>
                  <p className="text-sm text-gray-600 mb-2">📍 {classItem.location}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    💰 {classItem.min_wage?.toLocaleString()} -{' '}
                    {classItem.max_wage?.toLocaleString()} đ
                  </p>
                  <p className="text-sm text-gray-600 mb-3">👤 {classItem.student_name || 'N/A'}</p>
                  <button
                    onClick={() => handleApply(classItem)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded transition"
                  >
                    ✍️ Ứng Tuyển
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Application Modal */}
      {showDetail && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Chi Tiết Ứng Tuyển</h3>
            <p className="text-gray-600 mb-2">
              <strong>Lớp:</strong> {selectedClass.subject_name}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Địa điểm:</strong> {selectedClass.location}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Lương:</strong> {selectedClass.min_wage?.toLocaleString()} -{' '}
              {selectedClass.max_wage?.toLocaleString()} đ
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lời Giới Thiệu (tối thiểu 20 ký tự)
            </label>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Viết lời giới thiệu về bản thân..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowDetail(false);
                  setIntroduction('');
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded transition"
              >
                {submitting ? '⏳ Đang gửi...' : '✅ Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSearchSection;

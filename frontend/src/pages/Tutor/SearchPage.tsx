import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { useProvinces } from '../../hooks/useProvinces';
import { useSubjects } from '../../hooks/useSubjects';
import { useSearchClasses } from '@/hooks/useTutorClasses';

import { Subject, Province } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

interface Filters {
  province_id: string;
  subject_id: string;
  classLevel: string;
  minRate: number;
  maxRate: number;
}
interface SearchPageProps {
  onTabChange?: (tab: string) => void;
}

export default function SearchPage({ onTabChange }: SearchPageProps) {
  // React Query - provinces & subjects
  const { data: provinces = [], isLoading: provincesLoading } = useProvinces(true);
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects(true);

  const [localFilters, setLocalFilters] = useState<Filters>({
    province_id: '',
    subject_id: '',
    classLevel: '',
    minRate: 0,
    maxRate: 999999,
  });
  // ✅ Memoize filters để tránh re-query liên tục
  const memoizedFilters = useMemo(
    () => ({
      province_id: localFilters.province_id,
      subject_id: localFilters.subject_id,
      classLevel: localFilters.classLevel,
      minRate: localFilters.minRate,
      maxRate: localFilters.maxRate,
    }),
    [
      localFilters.province_id,
      localFilters.subject_id,
      localFilters.classLevel,
      localFilters.minRate,
      localFilters.maxRate,
    ]
  );

  // ✅ DÙNG: Hook useSearchClasses với memoized filters
  const {
    data: classes = [],
    isLoading: classesLoading,
    error: classesError,
  } = useSearchClasses(memoizedFilters);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const { name, value } = e.target;
      let parsedValue: string | number = value;
      if (name.includes('Rate')) {
        parsedValue = parseFloat(value) || 0;
      }
      setLocalFilters((prev) => ({ ...prev, [name]: parsedValue }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setLocalFilters({
      province_id: '',
      subject_id: '',
      classLevel: '',
      minRate: 0,
      maxRate: 999999,
    });
  }, []);

  const handleClassClick = useCallback(
    (class_id: string | number) => {
      console.log('🖱️ Click Xem chi tiết, classId:', class_id);
      // ✅ SỬA: Lưu vào sessionStorage + gọi onTabChange
      sessionStorage.setItem('currentClassId', class_id.toString());

      if (onTabChange) {
        console.log('📍 Chuyển sang tab class-detail');
        onTabChange('class-detail'); // ✅ Ở trong HomePage
      }
    },
    [onTabChange]
  );

  // const handleApplyClass = useCallback((classId: string | number) => {
  //   console.log('Apply for class:', classId);
  // }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ GỠ: DevNavigation - đã được render ở HomePage */}

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
                  <option key={s.subject_id || index} value={s.subject_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khối lớp</label>
              <select
                name="classLevel"
                value={localFilters.classLevel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn khối lớp --</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade} value={grade.toString()}>
                    Lớp {grade}
                  </option>
                ))}
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
            <Button onClick={handleResetFilters} className="w-full">
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
            ❌ Lỗi: {(classesError as any)?.message || 'Lỗi tải lớp'}
          </div>
        )}

        {/* Classes List */}
        {!classesLoading && (
          <div>
            <p className="text-gray-600 mb-4">
              Tìm thấy <strong>{classes.length}</strong> lớp
            </p>

            {classes.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-6 rounded text-center">
                ⚠️ Không tìm thấy lớp phù hợp
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls: any) => (
                  <Card key={cls.class_id} className="relative">
                    {cls.application_status === 'applied' && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Đã ứng tuyển</span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>
                        {cls.subject_name}
                        {cls.gradeLevel && (
                          <span className="text-sm text-gray-500"> Lớp {cls.gradeLevel}</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>📍 {cls.province_name || 'Không xác định'}</p>
                        <p>💰 {cls.hourly_price?.toLocaleString()} VNĐ/giờ</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleClassClick(cls.class_id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Xem chi tiết
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

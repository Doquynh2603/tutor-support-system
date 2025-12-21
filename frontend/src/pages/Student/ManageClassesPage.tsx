import React, { useEffect, useState } from 'react';
import { useClass } from '../../hooks/useClass';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Phone,
  Edit,
  Trash2,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { EditClassModal } from '../../components/Student/EditClassModal';
import { CancelClassModal } from '../../components/Student/CancelClassModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSessionFilter from '@/hooks/useSessionFilter';

type FilterStatus = 'recruiting' | 'has_tutor' | 'active' | 'completed' | 'cancelled';
type ViewMode = 'list' | 'detail' | 'tutors';

interface ManageClassesPageProps {
  onTabChange?: (tab: string) => void;
}

const ManageClassesPage: React.FC<ManageClassesPageProps> = ({ onTabChange }) => {
  const [filter, setFilter] = useState<FilterStatus>('recruiting');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // ✅ THÊM: viewMode
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null); // ✅ THÊM: selectedClassId
  const { getMyClasses, loading } = useClass();
  const [classes, setClasses] = useState<any[]>([]);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

  // Cancel Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedClassForCancel, setSelectedClassForCancel] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ✅ FIX: Bỏ dependency array rỗng để useEffect chạy mỗi khi component re-render
  // Điều này đảm bảo khi click notification lần 2, sessionStorage được đọc lại
  useSessionFilter('targetFilter', (value: string) => {
    if (['recruiting', 'has_tutor', 'active', 'completed', 'cancelled'].includes(value)) {
      console.log('🔄 Đặt filter:', value);
      setFilter(value as FilterStatus);
    }
  });

  // ✅ THÊM: Xử lý expandClassId riêng vì cần logic scroll
  useEffect(() => {
    const expandId = sessionStorage.getItem('expandClassId');
    if (expandId) {
      console.log('📂 Auto-expand classId:', expandId);
      setExpandedClassId(expandId);
      sessionStorage.removeItem('expandClassId');
      console.log('🗑️ Đã xóa expandClassId khỏi sessionStorage');
      setTimeout(() => {
        const element = document.getElementById(`class-${expandId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const result = await getMyClasses();
        setClasses(result);
        console.log('Classes fetched:', result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp:', error);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((c) => c.class_status === filter);
  const currentClass = classes.find((c) => c.class_id === selectedClassId);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      recruiting: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tìm gia sư' },
      has_tutor: { bg: 'bg-green-100', text: 'text-green-800', label: 'Có gia sư' },
      active: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang học' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã kết thúc' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };

    const cfg = config[status] || config.recruiting;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  };

  const toggleExpand = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  const handleEditClick = (classItem: any) => {
    setSelectedClass(classItem);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenCancelModal = (classId: string, className: string) => {
    setSelectedClassForCancel({ id: classId, name: className });
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedClassForCancel(null);
  };

  const handleUpdateSuccess = () => {
    const fetchClasses = async () => {
      try {
        const result = await getMyClasses();
        setClasses(result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp:', error);
      }
    };
    fetchClasses();
  };

  const handleCancelSuccess = () => {
    handleUpdateSuccess();
    setFilter('cancelled');
  };

  // ✅ THÊM: Xem chi tiết lớp
  const handleViewDetail = (classId: string) => {
    setSelectedClassId(classId);
    setViewMode('detail');
  };

  // ✅ THÊM: Xem ứng tuyển
  const handleViewTutors = (classId: string) => {
    setSelectedClassId(classId);
    setViewMode('tutors');
  };

  // ✅ THÊM: Quay lại danh sách
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClassId(null);
  };

  // ✅ THÊM: Render chi tiết lớp học
  const renderClassDetail = () => {
    if (!currentClass) return null;

    return (
      <div className="space-y-6">
        {/* Header với nút quay lại */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h2 className="text-3xl font-bold text-gray-900">
            {currentClass.subject_name} - Lớp {currentClass.classLevel}
          </h2>
        </div>

        {/* Thông tin lớp */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <div className="mt-1">{getStatusBadge(currentClass.class_status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá/Giờ</p>
                  <p className="font-medium text-lg">
                    {currentClass.hourly_price?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa điểm</p>
                  <p className="font-medium">
                    {currentClass.classLocation}, {currentClass.ward_name},{' '}
                    {currentClass.district_name}, {currentClass.province_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mô tả lớp</p>
                  <p className="font-medium">{currentClass.classDescription || 'Chưa có'}</p>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ứng tuyển</p>
                  <p className="font-medium text-lg">{currentClass.applied_tutors_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đã mời</p>
                  <p className="font-medium text-lg">{currentClass.invited_tutors_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium">
                    {currentClass.start_date
                      ? new Date(currentClass.start_date).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kết thúc</p>
                  <p className="font-medium">
                    {currentClass.end_date
                      ? new Date(currentClass.end_date).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gia sư hiện tại */}
            {currentClass.tutor_name && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">📋 Thông Tin Gia Sư</h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tên</p>
                      <p className="font-medium">{currentClass.tutor_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${currentClass.tutor_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {currentClass.tutor_email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Điện thoại</p>
                      <a
                        href={`tel:${currentClass.tutor_phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {currentClass.tutor_phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Đánh giá</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{currentClass.tutor_rating} / 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {currentClass.class_status === 'recruiting' && (
              <div className="mt-6 pt-6 border-t flex gap-2 flex-wrap">
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleEditClick(currentClass)}
                >
                  <Edit className="w-4 h-4" />
                  Sửa Thông Tin
                </Button>

                {currentClass.applied_tutors_count > 0 && (
                  <Button
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => handleViewTutors(currentClass.class_id)}
                  >
                    <Users className="w-4 h-4" />
                    Xem Ứng Tuyển ({currentClass.applied_tutors_count})
                  </Button>
                )}

                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() =>
                    handleOpenCancelModal(currentClass.class_id, currentClass.subject_name)
                  }
                >
                  <Trash2 className="w-4 h-4" />
                  Hủy Lớp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ✅ THÊM: Render danh sách ứng tuyển
  const renderTutorsList = () => {
    if (!currentClass) return null;

    const applicants = currentClass.applicants || [];

    return (
      <div className="space-y-6">
        {/* Header với nút quay lại */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <h2 className="text-3xl font-bold text-gray-900">
            Ứng Tuyển - {currentClass.subject_name} Lớp {currentClass.classLevel}
          </h2>
        </div>

        {applicants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Không có ứng tuyển nào</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicants.map((tutor) => (
              <Card key={tutor.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{tutor.name}</h3>
                        <p className="text-sm text-gray-600">{tutor.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{tutor.rating || 5}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {tutor.phone}
                    </div>

                    {tutor.description && (
                      <div>
                        <p className="text-sm text-gray-600">Giới thiệu</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{tutor.description}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">✓ Chọn</Button>
                      <Button variant="outline" className="flex-1">
                        💬 Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ✅ THÊM: Render danh sách lớp
  const renderClassList = () => {
    if (filteredClasses.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Không có lớp học nào</p>
            {filter === 'recruiting' && (
              <Button
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('create-class');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ➕ Tạo Lớp Mới
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredClasses.map((classItem) => (
          <Card
            key={classItem.class_id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardContent className="pt-6">
              <div
                onClick={() => toggleExpand(classItem.class_id)}
                className="flex justify-between items-start mb-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {classItem.subject_name} {classItem.classLevel}
                    </h3>
                    {expandedClassId === classItem.class_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Địa điểm: {classItem.classLocation}, {classItem.ward_name},{' '}
                    {classItem.district_name}, {classItem.province_name || 'Chưa xác định'}
                  </p>
                </div>
                {getStatusBadge(classItem.class_status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div>
                  <p className="text-xs text-gray-500">Giá/Giờ</p>
                  <p className="font-medium">
                    {classItem.hourly_price?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ứng Tuyển</p>
                  <p className="font-medium">{classItem.applied_tutors_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Đã Mời</p>
                  <p className="font-medium">{classItem.invited_tutors_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gia Sư</p>
                  <p className="font-medium">{classItem.tutor_id ? '✅ Có' : '❌ Chưa'}</p>
                </div>
              </div>

              {expandedClassId === classItem.class_id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {classItem.tutor_name ? (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3">📋 Gia Sư</h4>
                      <p className="text-sm">{classItem.tutor_name}</p>
                    </div>
                  ) : classItem.class_status !== 'cancelled' ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm">
                        ℹ️ <strong>Chưa có gia sư</strong>
                      </p>
                    </div>
                  ) : null}

                  {/* ✅ SỬA: Buttons gọi handleViewDetail / handleViewTutors */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => handleViewDetail(classItem.class_id)}>
                      📋 Xem Chi Tiết
                    </Button>

                    {classItem.class_status === 'recruiting' && (
                      <>
                        <Button
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleEditClick(classItem)}
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </Button>

                        {classItem.applied_tutors_count > 0 && (
                          <Button
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleViewTutors(classItem.class_id)}
                          >
                            <Users className="w-4 h-4" />
                            Ứng Tuyển ({classItem.applied_tutors_count})
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() =>
                            handleOpenCancelModal(classItem.class_id, classItem.subject_name)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Hủy
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ✅ GỠ: min-h-screen bg-gray-50 - HomePage đã wrapper */}
      {viewMode === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lớp Học</h1>
            <Button
              onClick={() => {
                if (onTabChange) {
                  onTabChange('create-class');
                }
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tạo Lớp Mới
            </Button>
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="recruiting">🔍 Tìm Gia Sư</TabsTrigger>
              <TabsTrigger value="has_tutor">✅ Có Gia Sư</TabsTrigger>
              <TabsTrigger value="active">▶️ Đang Học</TabsTrigger>
              <TabsTrigger value="completed">🏁 Hoàn Thành</TabsTrigger>
              <TabsTrigger value="cancelled">❌ Hủy</TabsTrigger>
            </TabsList>

            <TabsContent value="recruiting" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : (
                renderClassList()
              )}
            </TabsContent>

            <TabsContent value="has_tutor" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : (
                renderClassList()
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : (
                renderClassList()
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : (
                renderClassList()
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : (
                renderClassList()
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ✅ THÊM: Render chi tiết lớp */}
      {viewMode === 'detail' && renderClassDetail()}

      {/* ✅ THÊM: Render danh sách ứng tuyển */}
      {viewMode === 'tutors' && renderTutorsList()}

      <EditClassModal
        isOpen={isEditModalOpen}
        classData={selectedClass}
        onClose={handleModalClose}
        onSuccess={handleUpdateSuccess}
      />

      <CancelClassModal
        isOpen={isCancelModalOpen}
        classId={selectedClassForCancel?.id || null}
        className={selectedClassForCancel?.name || null}
        onClose={handleCloseCancelModal}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
};

export default ManageClassesPage;

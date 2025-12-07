import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Mail,
  Edit,
  Trash2,
  Home,
  AlertCircle,
  Users,
} from 'lucide-react';
import { EditClassModal } from '../../components/Student/EditClassModal';
import { CancelClassModal } from '../../components/Student/CancelClassModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FilterStatus = 'recruiting' | 'has_tutor' | 'active' | 'completed' | 'cancelled';

const ManageClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>('recruiting');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const result = await getMyClasses();
        setClasses(result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp:', error);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((c) => c.status === filter);

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
    // Reload classes
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
    // ✅ Navigate sang tab 'cancelled' để xem lớp vừa hủy
    setFilter('cancelled');
  };

  const renderClassList = () => {
    if (filteredClasses.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Không có lớp học nào</p>
            <Button onClick={() => navigate('/student/create-class')}>Tạo Lớp Mới</Button>
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
              {/* Main Row - Clickable to Expand */}
              <div
                onClick={() => toggleExpand(classItem.class_id)}
                className="flex justify-between items-start mb-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {classItem.subject_name}
                    </h3>
                    {expandedClassId === classItem.class_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{classItem.description}</p>
                </div>
                {getStatusBadge(classItem.status)}
              </div>

              {/* Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                <div>
                  <p className="text-xs text-gray-500">Giá/Giờ</p>
                  <p className="font-medium">
                    {classItem.hourly_price?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lịch Học</p>
                  <p className="font-medium">{classItem.schedule_count || 0} buổi/tuần</p>
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
                  <p className="font-medium">{classItem.tutor_name ? '✅ Có' : '❌ Chưa'}</p>
                </div>
              </div>

              {/* Expanded Content - Tutor Details or Cancellation Reason */}
              {expandedClassId === classItem.class_id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* ✅ Hiển thị lý do hủy khi status = cancelled */}
                  {classItem.status === 'cancelled' && classItem.cancellation_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 mb-1">Lý do hủy lớp</h4>
                          <p className="text-sm text-red-800">{classItem.cancellation_reason}</p>
                          {classItem.updated_at && (
                            <p className="text-xs text-red-700 mt-2">
                              Hủy lúc: {new Date(classItem.updated_at).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tutor Details (khi có gia sư) */}
                  {classItem.tutor_name ? (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3">📋 Thông Tin Gia Sư</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Tên:</span>
                          <span className="font-medium text-gray-900">{classItem.tutor_name}</span>
                        </div>

                        {classItem.tutor_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a
                              href={`mailto:${classItem.tutor_email}`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {classItem.tutor_email}
                            </a>
                          </div>
                        )}

                        {classItem.tutor_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a
                              href={`tel:${classItem.tutor_phone}`}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {classItem.tutor_phone}
                            </a>
                          </div>
                        )}

                        {classItem.tutor_rating && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">
                              <strong>{classItem.tutor_rating}</strong> / 5.0
                              {classItem.tutor_reviews && (
                                <span className="text-gray-500 ml-1">
                                  ({classItem.tutor_reviews} đánh giá)
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {classItem.tutor_description && (
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Giới thiệu:</p>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {classItem.tutor_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : classItem.status !== 'cancelled' ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        ℹ️ <strong>Chưa có gia sư</strong> - Hãy mời hoặc chờ gia sư ứng tuyển
                      </p>
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => {
                        sessionStorage.setItem('currentClassId', classItem.class_id);
                        navigate('/student/class-detail');
                      }}
                    >
                      Xem Chi Tiết
                    </Button>

                    {classItem.status === 'recruiting' && (
                      <>
                        <Button
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleEditClick(classItem)}
                        >
                          <Edit className="w-4 h-4" />
                          Sửa Thông Tin
                        </Button>

                        <Button
                          variant="destructive"
                          className="gap-2"
                          onClick={() =>
                            handleOpenCancelModal(classItem.class_id, classItem.subject_name)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                          Hủy Lớp
                        </Button>

                        {/* ✅ NEW BUTTON: Xem Ứng Tuyển */}
                        {classItem.applied_tutors_count > 0 && (
                          <Button
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              sessionStorage.setItem('currentClassId', classItem.class_id);
                              navigate(`/student/view-tutors`);
                            }}
                          >
                            <Users className="w-4 h-4" />
                            Xem Ứng Tuyển ({classItem.applied_tutors_count})
                          </Button>
                        )}
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lớp Học</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={() => navigate('/')}>
              <Home className="w-4 h-4" />
              Trở về Trang Chủ
            </Button>
            <Button onClick={() => navigate('/student/create-class')} className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo Lớp Mới
            </Button>
          </div>
        </div>

        {/* Tabs using shadcn */}
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as FilterStatus)}
          className="mb-6"
        >
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
      </div>

      {/* Edit Class Modal */}
      <EditClassModal
        isOpen={isEditModalOpen}
        classData={selectedClass}
        onClose={handleModalClose}
        onSuccess={handleUpdateSuccess}
      />

      {/* Cancel Class Modal */}
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

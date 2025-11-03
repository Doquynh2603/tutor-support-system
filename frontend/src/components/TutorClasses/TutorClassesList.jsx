import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, CheckCircle, PlusCircle } from 'lucide-react';
import { useTutorClasses } from '../../hooks/useTutorClasses';
import TutorClassDetail from './TutorClassDetail';

const TutorClassesList = () => {
  const [activeTab, setActiveTab] = useState('in_progress');
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Fetch danh sách lớp theo tab
  const { data: classesResponse, isLoading } = useTutorClasses(activeTab);
  const classes = classesResponse?.data || [];

  // Nếu đang xem chi tiết lớp, hiển thị TutorClassDetail component
  if (selectedClassId) {
    return <TutorClassDetail classId={selectedClassId} onBack={() => setSelectedClassId(null)} />;
  }

  const getTabLabel = (status) => {
    switch (status) {
      case 'in_progress':
        return '🎓 Lớp Đang Dạy';
      case 'has_tutor':
        return '✅ Lớp Được Duyệt';
      case 'recruiting':
        return '🔍 Đang Tuyển';
      case 'completed':
        return '🏁 Lớp Hoàn Thành';
      case 'cancelled':
        return '❌ Lớp Đã Hủy';
      default:
        return status;
    }
  }; // eslint-disable-line no-unused-vars

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Danh Sách Lớp Học Của Tôi
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recruiting">
            <span className="hidden sm:inline">Đang Tuyển</span>
            {/* <span className="sm:hidden">Tuyển</span> */}
          </TabsTrigger>
          <TabsTrigger value="has_tutor">
            <span className="hidden sm:inline">Đã có gia sư</span>
            {/* <span className="sm:hidden">Tuyển</span> */}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            <span className="hidden sm:inline">Lớp Đang Dạy</span>
            {/* <span className="sm:hidden">Đang Dạy</span> */}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <span className="hidden sm:inline">Đã hoàn thành</span>
            {/* <span className="sm:hidden">Duyệt</span> */}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            <span className="hidden sm:inline">Đã hủy</span>
            {/* <span className="sm:hidden">Duyệt</span> */}
          </TabsTrigger>
        </TabsList>
        {/* Tab: Đang Tuyển */}
        <TabsContent value="recruiting" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải dữ liệu...
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                Không có lớp học nào đang tuyển
              </CardContent>
            </Card>
          ) : (
            <ClassesList classes={classes} onSelectClass={setSelectedClassId} status={activeTab} />
          )}
        </TabsContent>

        {/* Tab: Lớp Được Duyệt */}
        <TabsContent value="has_tutor" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải dữ liệu...
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 mr-2" />
                Bạn chưa được duyệt cho lớp nào
              </CardContent>
            </Card>
          ) : (
            <ClassesList classes={classes} onSelectClass={setSelectedClassId} status={activeTab} />
          )}
        </TabsContent>
        {/* Tab: Lớp Đang Dạy */}
        <TabsContent value="in_progress" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải dữ liệu...
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                <PlusCircle className="h-5 w-5 mr-2" />
                Hiện tại bạn chưa có lớp học nào
              </CardContent>
            </Card>
          ) : (
            <ClassesList classes={classes} onSelectClass={setSelectedClassId} status={activeTab} />
          )}
        </TabsContent>
        {/* Tab: Lớp Đã hoàn thành */}
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải dữ liệu...
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 mr-2" />
                Bạn chưa được duyệt cho lớp nào
              </CardContent>
            </Card>
          ) : (
            <ClassesList classes={classes} onSelectClass={setSelectedClassId} status={activeTab} />
          )}
        </TabsContent>
        {/* Tab: Lớp Đã hủy */}
        <TabsContent value="cancelled" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Đang tải dữ liệu...
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                <CheckCircle className="h-5 w-5 mr-2" />
                Không có lớp học nào đã hủy
              </CardContent>
            </Card>
          ) : (
            <ClassesList classes={classes} onSelectClass={setSelectedClassId} status={activeTab} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Hàm chuyển đổi day_of_week thành tên ngày
 */
const getDayName = (dayOfWeek) => {
  const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  return days[dayOfWeek] || '';
};

/**
 * Hàm format time từ ISO string thành HH:mm
 */
const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeString;
  }
};

/**
 * Component hiển thị danh sách lớp học
 */
const ClassesList = ({ classes, onSelectClass }) => {
  // Backend đã trả về schedules array, không cần group lại
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Card
          key={cls.class_id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectClass(cls.class_id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {cls.subject_name} {cls.gradeLevel}
                </CardTitle>
                <CardDescription className="text-sm">{cls.student_name}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {/* Lịch học */}
              {cls.schedules && cls.schedules.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground font-semibold">Lịch Học</label>
                  <div className="space-y-1 mt-1">
                    {cls.schedules.map((schedule) => (
                      <div key={schedule.schedule_id} className="bg-blue-50 p-2 rounded text-xs">
                        <span className="font-semibold">{getDayName(schedule.day_of_week)}</span>{' '}
                        <span>
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút xem chi tiết */}
              <div className="pt-2">
                <Button className="w-full" size="sm" variant="default">
                  Xem Chi Tiết
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default TutorClassesList;

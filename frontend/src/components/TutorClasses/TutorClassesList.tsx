import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, BookOpen, CheckCircle, PlusCircle } from 'lucide-react';
import { useTutorClasses } from '../../hooks/useTutorClasses';
import TutorClassDetail from './TutorClassDetail';
import { TutorClass } from '@/types';
import dayjs from 'dayjs';

interface ClassesListProps {
  classes: TutorClass[];
  onSelectClass: (classId: string) => void;
}

const getDayName = (dayOfWeek: number): string => {
  const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  return days[dayOfWeek] || '';
};

const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeString;
  }
};

const ClassesList: React.FC<ClassesListProps> = ({ classes, onSelectClass }) => {
  console.log('Classes', classes);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((cls) => (
        <Card
          key={cls.class_id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectClass(String(cls.class_id))}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{cls.subject_name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {cls.schedules && cls.schedules.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground font-semibold">Lịch Học</label>
                  <div className="space-y-1 mt-1">
                    {cls.schedules.map((schedule) => (
                      <div key={schedule.schedule_id} className="bg-blue-50 p-2 rounded text-xs">
                        <span className="font-semibold">{getDayName(schedule.day_of_week)}</span>{' '}
                        <span>
                          {formatTime(schedule.start_date)} - {formatTime(schedule.end_date)}
                        </span>{' '}
                        <span>Ngày{dayjs(schedule.start_date).format('DD/MM/YYYY')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

const TutorClassesList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'in_progress' | 'has_tutor' | 'recruiting' | 'completed' | 'cancelled'
  >('in_progress');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const { data: classesResponse, isLoading } = useTutorClasses(activeTab);
  const classes: TutorClass[] = classesResponse || [];

  if (selectedClassId) {
    return <TutorClassDetail classId={selectedClassId} onBack={() => setSelectedClassId(null)} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Danh Sách Lớp Học Của Tôi
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recruiting">Đang Tuyển</TabsTrigger>
          <TabsTrigger value="has_tutor">Đã có gia sư</TabsTrigger>
          <TabsTrigger value="in_progress">Lớp Đang Dạy</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
        </TabsList>

        {(['recruiting', 'has_tutor', 'in_progress', 'completed', 'cancelled'] as const).map(
          (status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải dữ liệu...
                  </CardContent>
                </Card>
              ) : classes.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
                    {status === 'recruiting' && <PlusCircle className="h-5 w-5 mr-2" />}
                    {status !== 'recruiting' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {status === 'recruiting'
                      ? 'Không có lớp học nào đang tuyển'
                      : status === 'cancelled'
                        ? 'Không có lớp học nào đã hủy'
                        : 'Bạn chưa được duyệt cho lớp nào'}
                  </CardContent>
                </Card>
              ) : (
                <ClassesList classes={classes} onSelectClass={setSelectedClassId} />
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
};

export default TutorClassesList;

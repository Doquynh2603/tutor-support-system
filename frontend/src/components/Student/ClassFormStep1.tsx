// frontend/src/components/Student/ClassFormStep1.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFormData,
  addSchedule,
  removeSchedule,
  updateSchedule,
} from '../../store/slices/classesSlice';
import { RootState } from '../../store';
import { subjectsAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Props {
  onNext: () => void;
}

const daysOfWeek = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 0, label: 'Chủ Nhật' },
];

const ClassFormStep1: React.FC<Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.classes.formData);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const data = await subjectsAPI.getSubjects();
        setSubjects(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách môn học:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    dispatch(setFormData({ ...formData, [field]: value } as any));
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    dispatch(updateSchedule({ index, field, value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông Tin Lớp Học</CardTitle>
        <CardDescription>Điền thông tin cơ bản về lớp học của bạn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject */}
        <div className="space-y-2">
          <Label>Môn học *</Label>
          <Select
            value={formData.subject_id}
            onValueChange={(val) => handleInputChange('subject_id', val)}
          >
            <SelectTrigger disabled={loadingSubjects}>
              <SelectValue placeholder="Chọn môn học" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.subject_id} value={subject.subject_id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Mô tả lớp học *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Mô tả về lớp học, mục tiêu học tập..."
            rows={4}
          />
        </div>

        {/* Requirement */}
        <div className="space-y-2">
          <Label>Yêu cầu đối với gia sư</Label>
          <Textarea
            value={formData.requirement}
            onChange={(e) => handleInputChange('requirement', e.target.value)}
            placeholder="Kinh nghiệm, kỹ năng..."
            rows={3}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label>Giá theo giờ (VNĐ) *</Label>
          <Input
            type="number"
            value={formData.hourly_price}
            onChange={(e) => handleInputChange('hourly_price', e.target.value)}
            placeholder="Ví dụ: 200000"
            min="50000"
            step="10000"
          />
          <p className="text-xs text-gray-500">Tối thiểu 50.000 VNĐ/giờ</p>
        </div>

        {/* Schedules */}
        <div className="space-y-3">
          <Label>Lịch học *</Label>
          <p className="text-xs text-gray-500">Chọn ngày học, ngày bắt đầu, giờ, và thời lượng buổi học</p>
          {formData.schedules.map((schedule, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg">
              {/* Day of week */}
              <Select
                value={schedule.day_of_week?.toString()}
                onValueChange={(val) => handleScheduleChange(index, 'day_of_week', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngày trong tuần" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Start date */}
              <div>
                <Label className="text-xs">Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={schedule.start_date}
                  onChange={(e) => handleScheduleChange(index, 'start_date', e.target.value)}
                />
              </div>

              {/* Start time and duration */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Giờ bắt đầu</Label>
                  <Input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Thời lượng (phút)</Label>
                  <Input
                    type="number"
                    value={schedule.duration_minutes}
                    onChange={(e) => handleScheduleChange(index, 'duration_minutes', e.target.value)}
                    placeholder="Ví dụ: 60, 90"
                    min="30"
                    step="15"
                  />
                </div>
              </div>

              {formData.schedules.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(removeSchedule(index))}
                  className="text-red-500 hover:text-red-700 w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa lịch
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(addSchedule())}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm lịch học
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
            Hủy
          </Button>
          <Button onClick={onNext} className="flex-1">
            Tiếp tục →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassFormStep1;

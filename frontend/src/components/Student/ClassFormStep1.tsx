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
import { Plus, Trash2 } from 'lucide-react';

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

interface FormDataState {
  subject_id: string;
  description: string;
  requirement: string;
  hourly_price: number | string;
  classLevel: number | string;
  start_date: string;
  end_date: string;
  schedules: Array<{
    day_of_week: number | string;
    start_time: string;
    end_time: string;
    duration_minutes: number | string;
  }>;
}

const ClassFormStep1: React.FC<Props> = ({ onNext }) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.classes.formData) as FormDataState;
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const safeFormData = {
    subject_id: formData?.subject_id ?? '',
    description: formData?.description ?? '',
    requirement: formData?.requirement ?? '',
    hourly_price: formData?.hourly_price ?? '',
    classLevel: formData?.classLevel ?? '',
    start_date: formData?.start_date ?? '',
    end_date: formData?.end_date ?? '',
    schedules: formData?.schedules ?? [
      {
        day_of_week: '',
        start_time: '',
        end_time: '',
        duration_minutes: '',
      },
    ],
  };

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
    dispatch(setFormData({ ...safeFormData, [field]: value } as any));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    console.log(`🔄 handleScheduleChange[${index}].${field} = "${value}"`);
    dispatch(updateSchedule({ index, field, value }));
  };

  // ✅ SỬA: Xóa prepareFormDataForSubmit - không cần transform ở đây
  // Transformation sẽ được làm ở CreateClassPage trước khi submit

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!safeFormData.subject_id) newErrors.subject_id = 'Vui lòng chọn môn học';
    if (!safeFormData.hourly_price || Number(safeFormData.hourly_price) <= 0)
      newErrors.hourly_price = 'Học phí phải lớn hơn 0';
    if (
      !safeFormData.classLevel ||
      Number(safeFormData.classLevel) < 1 ||
      Number(safeFormData.classLevel) > 12
    )
      newErrors.classLevel = 'Cấp lớp phải từ 1 đến 12';
    if (!safeFormData.start_date) newErrors.start_date = 'Vui lòng chọn ngày bắt đầu';
    if (!safeFormData.end_date) newErrors.end_date = 'Vui lòng chọn ngày kết thúc';

    const startDate = new Date(safeFormData.start_date);
    const endDate = new Date(safeFormData.end_date);
    if (startDate >= endDate) {
      newErrors.dates = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!safeFormData.schedules || safeFormData.schedules.length === 0) {
      newErrors.schedules = 'Vui lòng thêm ít nhất 1 lịch học';
    }

    // ✅ SỬA: Validate schedule chi tiết
    const invalidSchedules = safeFormData.schedules.some((s) => {
      // Validate required fields
      if (!s.day_of_week || !s.start_time || !s.end_time || !s.duration_minutes) {
        console.warn('❌ Missing required schedule fields:', s);
        return true;
      }

      // ✅ Validate end_time không phải NaN
      if (String(s.end_time).includes('NaN')) {
        console.error('❌ end_time is NaN:', s);
        return true;
      }

      // Validate time format
      const [startHour, startMin] = String(s.start_time).split(':').map(Number);
      const [endHour, endMin] = String(s.end_time).split(':').map(Number);

      if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
        console.warn('❌ Invalid time format:', { startHour, startMin, endHour, endMin });
        return true;
      }

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        console.warn('❌ start_time >= end_time:', { startMinutes, endMinutes });
        return true;
      }

      return false;
    });

    if (invalidSchedules) {
      newErrors.schedules =
        'Vui lòng điền đầy đủ thông tin lịch học và đảm bảo giờ kết thúc > giờ bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('\n=== 🚀 STEP 1 VALIDATION ===');
    console.log('Current formData:', JSON.stringify(safeFormData, null, 2));

    if (validateForm()) {
      console.log('✅ Validation passed, calling onNext()');
      onNext();
    } else {
      console.log('❌ Validation failed');
      alert('⚠️ Vui lòng kiểm tra lại thông tin');
    }
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
          <Label>
            Môn học <span className="text-red-500">*</span>
          </Label>
          <Select
            value={safeFormData.subject_id}
            onValueChange={(val) => handleInputChange('subject_id', val)}
          >
            <SelectTrigger className={errors.subject_id ? 'border-red-500' : ''}>
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
          {errors.subject_id && <p className="text-red-500 text-sm">{errors.subject_id}</p>}
        </div>

        {/* Class Level */}
        <div className="space-y-2">
          <Label>
            Cấp lớp <span className="text-red-500">*</span>
          </Label>
          <Select
            value={safeFormData.classLevel ? String(safeFormData.classLevel) : ''}
            onValueChange={(val) => handleInputChange('classLevel', parseInt(val))}
          >
            <SelectTrigger className={errors.classLevel ? 'border-red-500' : ''}>
              <SelectValue placeholder="Chọn cấp lớp" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((level) => (
                <SelectItem key={level} value={String(level)}>
                  Lớp {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classLevel && <p className="text-red-500 text-sm">{errors.classLevel}</p>}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Ngày bắt đầu <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={safeFormData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className={errors.start_date ? 'border-red-500' : ''}
            />
            {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Ngày kết thúc <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={safeFormData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className={errors.end_date ? 'border-red-500' : ''}
            />
            {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
          </div>
        </div>

        {errors.dates && <p className="text-red-500 text-sm">{errors.dates}</p>}

        {/* Description */}
        <div className="space-y-2">
          <Label>
            Mô tả lớp học <span className="text-gray-500 text-xs">(tùy chọn)</span>
          </Label>
          <Textarea
            value={safeFormData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Mô tả về lớp học, mục tiêu học tập... (có thể bỏ trống)"
            rows={3}
          />
        </div>

        {/* Requirement */}
        <div className="space-y-2">
          <Label>
            Yêu cầu đối với gia sư <span className="text-gray-500 text-xs">(tùy chọn)</span>
          </Label>
          <Textarea
            value={safeFormData.requirement}
            onChange={(e) => handleInputChange('requirement', e.target.value)}
            placeholder="Kinh nghiệm, kỹ năng, chứng chỉ... (có thể bỏ trống)"
            rows={3}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label>
            Giá theo giờ (VNĐ) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            value={safeFormData.hourly_price}
            onChange={(e) => handleInputChange('hourly_price', e.target.value)}
            placeholder="Ví dụ: 180000"
            min="50000"
            step="10000"
            className={errors.hourly_price ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">Tối thiểu 50.000 VNĐ/giờ</p>
          {errors.hourly_price && <p className="text-red-500 text-sm">{errors.hourly_price}</p>}
        </div>

        {/* Schedules */}
        <div className="space-y-3">
          <Label>
            Lịch học <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500">
            💡 Nhập giờ bắt đầu + thời lượng (phút) → giờ kết thúc tự động tính
          </p>

          {safeFormData.schedules.map((schedule, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg border">
              {/* Day of week */}
              <div>
                <Label className="text-xs">Ngày trong tuần</Label>
                <Select
                  value={schedule.day_of_week ? String(schedule.day_of_week) : ''}
                  onValueChange={(val) => handleScheduleChange(index, 'day_of_week', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngày trong tuần" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start time */}
              <div>
                <Label className="text-xs">Giờ bắt đầu</Label>
                <Input
                  type="time"
                  value={schedule.start_time ?? ''}
                  onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                />
              </div>

              {/* Duration minutes */}
              <div>
                <Label className="text-xs">
                  Thời lượng (phút) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={schedule.duration_minutes ?? ''}
                  onChange={(e) => handleScheduleChange(index, 'duration_minutes', e.target.value)}
                  placeholder="60, 90, 120"
                  min="30"
                  step="15"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  {schedule.start_time && schedule.duration_minutes
                    ? `⏱️ ${schedule.start_time} + ${schedule.duration_minutes}phút`
                    : '⚠️ Nhập giờ bắt đầu & thời lượng để tính giờ kết thúc'}
                </p>
              </div>

              {/* End time (read-only) */}
              <div>
                <Label className="text-xs">Giờ kết thúc (tự động)</Label>
                <Input
                  type="time"
                  value={schedule.end_time ?? ''}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                {schedule.end_time && !String(schedule.end_time).includes('NaN') && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ {schedule.start_time} + {schedule.duration_minutes}p = {schedule.end_time}
                  </p>
                )}
                {schedule.end_time && String(schedule.end_time).includes('NaN') && (
                  <p className="text-xs text-red-600 mt-1">
                    ❌ Lỗi tính toán - vui lòng kiểm tra giờ bắt đầu & thời lượng
                  </p>
                )}
              </div>

              {safeFormData.schedules.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(removeSchedule(index))}
                  className="text-red-500 hover:text-red-700 w-full mt-2"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa lịch
                </Button>
              )}
            </div>
          ))}

          {errors.schedules && <p className="text-red-500 text-sm">{errors.schedules}</p>}

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
          <Button onClick={handleNext} className="flex-1">
            Tiếp tục →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassFormStep1;

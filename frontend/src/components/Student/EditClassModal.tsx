import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClass } from '../../hooks/useClass';
import { ClassDetail } from '../../types';

interface EditClassModalProps {
  isOpen: boolean;
  classData: ClassDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  classData,
  onClose,
  onSuccess,
}) => {
  const { updateClass } = useClass();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    requirement: '',
    hourly_price: 0,
    classLevel: 0,
    subject_name: '', // ✅ Added subject_name
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (classData && isOpen) {
      console.log('classData: ', classData);

      setFormData({
        description: classData.description || '',
        requirement: classData.requirement || '',
        hourly_price: classData.hourly_price || 0,
        classLevel: classData.classLevel || 0,
        subject_name: classData.subject_name || '', // ✅ Populate subject_name
      });
      setErrors({});
    }
  }, [isOpen, classData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hourly_price' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ THÊM: Handler cho Select classLevel
  const handleClassLevelChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      classLevel: Number(value),
    }));
    // Clear error for this field
    if (errors.classLevel) {
      setErrors((prev) => ({ ...prev, classLevel: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // if (!formData.description.trim()) {
    //   newErrors.description = 'Vui lòng nhập mô tả lớp học';
    // }

    // if (!formData.requirement.trim()) {
    //   newErrors.requirement = 'Vui lòng nhập yêu cầu gia sư';
    // }

    if (formData.hourly_price <= 0) {
      newErrors.hourly_price = 'Học phí phải lớn hơn 0';
    }

    // ✅ Validate: Học phí chỉ được tăng
    if (classData && formData.hourly_price < classData.hourly_price) {
      newErrors.hourly_price = 'Học phí chỉ được phép tăng, không được giảm';
    }

    if (formData.classLevel <= 0) {
      newErrors.classLevel = 'Vui lòng chọn cấp lớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!classData?.class_id) return;

    // ✅ Validation
    if (!validateForm()) {
      alert('⚠️ Vui lòng điền đầy đủ tất cả thông tin');
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Confirm dialog
      const confirmed = window.confirm(
        'Bạn chắc chắn muốn sửa thông tin lớp học này?\nTất cả gia sư ứng tuyển/được mời sẽ được thông báo.'
      );

      if (!confirmed) return;

      await updateClass(classData.class_id, formData);

      alert('✅ Cập nhật lớp học thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating class:', error);
      alert('❌ Lỗi khi cập nhật lớp học: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Sửa thông tin lớp học</DialogTitle>
          <DialogDescription className="text-sm">
            Cập nhật thông tin lớp học. Gia sư sẽ được thông báo về những thay đổi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Subject - Display Only */}
          <div className="space-y-1">
            <Label className="text-sm">Môn học</Label>
            <div className="px-2 py-1.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm">
              {formData.subject_name || 'Không xác định'}
            </div>
          </div>

          {/* ✅ THÊM: Class Level Select */}
          <div className="space-y-1">
            <Label htmlFor="classLevel" className="text-sm">
              Cấp lớp
            </Label>
            <div className="px-2 py-1.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm">
              Lớp {formData.classLevel}
            </div>
            <p className="text-xs text-gray-500">Không thể thay đổi cấp lớp</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">
              Mô tả lớp học
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết về lớp học..."
              rows={3}
              className={`text-sm ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Requirement */}
          <div className="space-y-1">
            <Label htmlFor="requirement" className="text-sm">
              Yêu cầu gia sư
            </Label>
            <Textarea
              id="requirement"
              name="requirement"
              value={formData.requirement}
              onChange={handleChange}
              placeholder="Nhập yêu cầu với gia sư (kinh nghiệm, trình độ, etc.)..."
              rows={3}
              className={`text-sm ${errors.requirement ? 'border-red-500' : ''}`}
            />
            {errors.requirement && <p className="text-xs text-red-500">{errors.requirement}</p>}
          </div>

          {/* Hourly Price */}
          <div className="space-y-1">
            <Label htmlFor="hourly_price" className="text-sm">
              Học phí (VNĐ/giờ)
            </Label>
            <Input
              id="hourly_price"
              type="number"
              name="hourly_price"
              value={formData.hourly_price || ''}
              onChange={handleChange}
              placeholder="Nhập học phí..."
              min="0"
              className={`text-sm ${errors.hourly_price ? 'border-red-500' : ''}`}
            />
            {errors.hourly_price && <p className="text-xs text-red-500">{errors.hourly_price}</p>}
            {formData.hourly_price > 0 && (
              <p className="text-xs text-muted-foreground">
                Ước tính: {(formData.hourly_price * 1.5).toLocaleString('vi-VN')} VNĐ (1.5 giờ)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} size="sm">
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isLoading ? '⏳ Đang lưu...' : '💾 Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

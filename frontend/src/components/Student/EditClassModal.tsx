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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (classData && isOpen) {
      console.log('classData: ', classData);

      setFormData({
        description: classData.description || '',
        requirement: classData.requirement || '',
        hourly_price: classData.hourly_price || 0,
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả lớp học';
    }

    if (!formData.requirement.trim()) {
      newErrors.requirement = 'Vui lòng nhập yêu cầu gia sư';
    }

    if (formData.hourly_price <= 0) {
      newErrors.hourly_price = 'Học phí phải lớn hơn 0';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>✏️ Sửa thông tin lớp học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của lớp học. Tất cả gia sư ứng tuyển/được mời sẽ được thông
            báo về những thay đổi này.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Subject - Display Only */}
          <div className="space-y-2">
            <Label>Môn học</Label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {classData?.subject_name || 'Không xác định'}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả lớp học</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết về lớp học..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Requirement */}
          <div className="space-y-2">
            <Label htmlFor="requirement">Yêu cầu gia sư</Label>
            <Textarea
              id="requirement"
              name="requirement"
              value={formData.requirement}
              onChange={handleChange}
              placeholder="Nhập yêu cầu với gia sư (kinh nghiệm, trình độ, etc.)..."
              rows={4}
              className={errors.requirement ? 'border-red-500' : ''}
            />
            {errors.requirement && <p className="text-sm text-red-500">{errors.requirement}</p>}
          </div>

          {/* Hourly Price */}
          <div className="space-y-2">
            <Label htmlFor="hourly_price">Học phí (VNĐ/giờ)</Label>
            <Input
              id="hourly_price"
              type="number"
              name="hourly_price"
              value={formData.hourly_price || ''}
              onChange={handleChange}
              placeholder="Nhập học phí..."
              min="0"
              className={errors.hourly_price ? 'border-red-500' : ''}
            />
            {errors.hourly_price && <p className="text-sm text-red-500">{errors.hourly_price}</p>}
            {formData.hourly_price > 0 && (
              <p className="text-xs text-muted-foreground">
                Ước tính chi phí: {(formData.hourly_price * 1.5).toLocaleString('vi-VN')} VNĐ (cho
                1.5 giờ)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

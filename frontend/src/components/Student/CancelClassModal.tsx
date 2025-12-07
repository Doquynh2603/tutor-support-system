import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useClass } from '../../hooks/useClass';

interface CancelClassModalProps {
  isOpen: boolean;
  classId: string | null;
  className: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelClassModal: React.FC<CancelClassModalProps> = ({
  isOpen,
  classId,
  className,
  onClose,
  onSuccess,
}) => {
  const { cancelClass } = useClass();
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!classId) return;

    // ✅ Validation - Lý do hủy là bắt buộc
    if (!cancellationReason.trim()) {
      setError('Vui lòng nhập lý do hủy lớp học');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await cancelClass(classId, cancellationReason.trim());

      alert('✅ Hủy lớp học thành công!');
      setCancellationReason('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error cancelling class:', error);
      const errorMsg = (error as any).message || 'Lỗi khi hủy lớp học';
      setError(errorMsg);
      alert('❌ ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCancellationReason(e.target.value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Xác nhận hủy lớp học
          </DialogTitle>
          <DialogDescription>Bạn chắc chắn muốn hủy lớp học "{className}"?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ Tất cả gia sư đang ứng tuyển/được mời sẽ được thông báo về việc hủy lớp học này.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Lý do hủy lớp <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={cancellationReason}
              onChange={handleReasonChange}
              placeholder="Nhập lý do hủy lớp (bắt buộc)..."
              rows={4}
              className={error ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-gray-500">
              Lý do này sẽ được gửi trong thông báo tới các gia sư
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Huỷ thao tác
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading || !cancellationReason.trim()}
          >
            {isLoading ? '⏳ Đang hủy...' : '🗑️ Xác nhận hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

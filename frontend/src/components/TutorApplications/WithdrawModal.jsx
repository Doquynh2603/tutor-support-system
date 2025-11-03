import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function WithdrawModal({ open, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-medium mb-3">
          Bạn có chắc chắn muốn rút đơn ứng tuyển lớp này?
        </h3>
        <p className="text-sm text-muted-foreground mb-3">Lý do (không bắt buộc)</p>
        <textarea
          className="w-full border rounded p-2 mb-4 resize-none"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: Lịch học trùng, thay đổi kế hoạch..."
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onClose()} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={() => onConfirm(reason)} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận rút đơn'}
          </Button>
        </div>
      </div>
    </div>
  );
}

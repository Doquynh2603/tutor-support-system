import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WithdrawModal from './WithdrawModal';
import useWithdrawApplication from '../../hooks/useWithdraw';

export default function AppliedItem({ application, onAfterWithdraw }) {
  const [open, setOpen] = useState(false);
  const mutation = useWithdrawApplication();

  const handleConfirm = async (reason) => {
    try {
      await mutation.mutateAsync({ applicationId: application.id, reason });
      setOpen(false);
      if (onAfterWithdraw) onAfterWithdraw();
    } catch (err) {
      console.error('Withdraw failed', err);
      // show error toast or alert
      alert(err?.response?.data?.message || 'Rút đơn thất bại');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle className="text-base">
              {application.subject_name} {application.gradeLevel || ''}
            </CardTitle>
            <CardDescription className="text-sm">{application.student_name}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">
              {application.hourly_rate ? `${application.hourly_rate} VND/h` : ''}
            </div>
            <div className="text-xs text-muted-foreground">{application.province_name}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>Mục tiêu / Yêu cầu: {application.requirement || '—'}</div>
          <div>Liên hệ: {application.student_phone || '—'}</div>
          {/* Render schedules if present */}
          {application.schedules && application.schedules.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1">Lịch học</div>
              <div className="grid gap-2">
                {application.schedules.map((s) => (
                  <div key={s.schedule_id} className="text-xs bg-slate-50 p-2 rounded">
                    {s.day_of_week}: {s.start_time || ''} - {s.end_time || ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3">
            <Button variant="destructive" onClick={() => setOpen(true)}>
              Rút đơn
            </Button>
          </div>
        </div>
      </CardContent>

      <WithdrawModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        loading={mutation.isLoading}
      />
    </Card>
  );
}

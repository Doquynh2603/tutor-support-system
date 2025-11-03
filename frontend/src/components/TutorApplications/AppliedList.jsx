import React from 'react';
import { useTutorApplications } from '../../hooks/useTutorClasses';
import AppliedItem from './AppliedItem';
import { Card, CardContent } from '@/components/ui/card';

export default function AppliedList({ status = 'applied' }) {
  const { data: appsResponse, isLoading, refetch } = useTutorApplications(status);
  const applications = appsResponse?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent>Đang tải danh sách ứng tuyển...</CardContent>
      </Card>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent>Không có đơn ứng tuyển</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <AppliedItem key={app.id} application={app} onAfterWithdraw={refetch} />
      ))}
    </div>
  );
}

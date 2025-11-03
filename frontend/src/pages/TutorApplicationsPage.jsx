import React, { useState } from 'react';
import AppliedList from '../components/TutorApplications/AppliedList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TutorApplicationsPage() {
  const [activeTab, setActiveTab] = useState('applied');

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý đơn ứng tuyển</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="applied">Đã ứng tuyển</TabsTrigger>
              <TabsTrigger value="withdrawn">Đã rút đơn</TabsTrigger>
              <TabsTrigger value="rejected">Bị từ chối</TabsTrigger>
              <TabsTrigger value="approved">Đã được duyệt</TabsTrigger>
            </TabsList>

            <TabsContent value="applied">
              <AppliedList status="applied" />
            </TabsContent>
            <TabsContent value="withdrawn">
              <AppliedList status="withdrawn" />
            </TabsContent>
            <TabsContent value="rejected">
              <AppliedList status="rejected" />
            </TabsContent>
            <TabsContent value="approved">
              <AppliedList status="approved" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

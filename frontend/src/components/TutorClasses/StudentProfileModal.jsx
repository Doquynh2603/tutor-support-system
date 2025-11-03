import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  School,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const StudentProfileModal = ({ student, isLoading, onBack }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải thông tin học viên...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Không thể tải thông tin học viên</AlertDescription>
            </Alert>
            <Button onClick={onBack} className="w-full mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay Lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(student.dateOfBirth);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header với nút quay lại */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{student.fullName}</h1>
          <p className="text-muted-foreground mt-1">Thông Tin Chi Tiết Học Viên</p>
        </div>
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay Lại
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thông tin cá nhân */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông Tin Cá Nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Họ và tên</label>
              <p className="font-semibold">{student.fullName}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {student.email}
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Số điện thoại</label>
              <p className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {student.phone || 'Chưa cập nhật'}
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Ngày sinh</label>
              <p className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'}
              </p>
            </div>

            {age && (
              <div>
                <label className="text-sm text-muted-foreground">Tuổi</label>
                <p className="font-semibold">{age} tuổi</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thông tin học tập */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Thông Tin Học Tập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Khối lớp</label>
              <p className="font-semibold">{student.gradeLevel} năm</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Trường học</label>
              <p className="font-semibold">{student.school || 'Chưa cập nhật'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Địa chỉ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Địa Chỉ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label className="text-sm text-muted-foreground">Tỉnh/Thành phố</label>
            <p className="font-semibold">{student.province_name || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Quận/Huyện</label>
            <p className="font-semibold">{student.ward_name || 'Chưa cập nhật'}</p>
          </div>
          {student.locationDetail && (
            <div>
              <label className="text-sm text-muted-foreground">Chi tiết địa chỉ</label>
              <p className="font-semibold">{student.locationDetail}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thông tin khác */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Khác</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label className="text-sm text-muted-foreground">Ngày tạo tài khoản</label>
            <p className="font-semibold">
              {new Date(student.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Cập nhật lần cuối</label>
            <p className="font-semibold">
              {new Date(student.updated_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfileModal;

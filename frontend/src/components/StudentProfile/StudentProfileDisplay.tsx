import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  Award,
} from 'lucide-react';
import dayjs from 'dayjs';
import { StudentProfile } from '../../types';
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}
interface StudentProfileDisplayProps {
  profile?: StudentProfile | null;
  onEdit?: () => void;
  isLoading?: boolean;
}

const StudentProfileDisplay: React.FC<StudentProfileDisplayProps> = ({
  profile,
  onEdit,
  isLoading,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  const getLocationName = () => {
    if (!profile?.province_name) return 'Chưa cập nhật';
    const parts = [profile.ward_name, profile.district_name, profile.province_name].filter(Boolean);
    return parts.join(', ');
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy thông tin profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{profile.name || 'Chưa cập nhật tên'}</h2>
              </div>
              <div className="flex gap-2">
                {profile.is_verified ? (
                  <Badge variant="success">Đã xác minh</Badge>
                ) : (
                  <Badge variant="secondary">Chưa xác minh</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {profile.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Calendar className="h-4 w-4" />}
              label="Ngày sinh"
              value={
                profile.dateOfBirth
                  ? dayjs(profile.dateOfBirth).format('DD/MM/YYYY')
                  : 'Chưa cập nhật'
              }
            />
            <InfoItem
              icon={<User className="h-4 w-4" />}
              label="Tuổi"
              value={profile.age ? `${profile.age} tuổi` : 'Chưa xác định'}
            />
            <InfoItem
              icon={<Phone className="h-4 w-4" />}
              label="Số điện thoại"
              value={profile.phone || 'Chưa cập nhật'}
            />
            <InfoItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={profile.email || 'Chưa cập nhật'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Địa chỉ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Tỉnh/Thành phố"
            value={getLocationName()}
          />
          {profile.locationDetail && (
            <InfoItem
              icon={<MapPin className="h-4 w-4" />}
              label="Địa chỉ chi tiết"
              value={profile.locationDetail}
              fullWidth
            />
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Thông tin học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<BookOpen className="h-4 w-4" />}
              label="Khối lớp"
              value={profile.gradeLevel ? `Lớp ${profile.gradeLevel}` : 'Chưa cập nhật'}
            />
            <InfoItem
              icon={<Award className="h-4 w-4" />}
              label="Trường học"
              value={profile.school || 'Chưa cập nhật'}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Thông tin hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Award className="h-4 w-4" />}
              label="Trạng thái tài khoản"
              value={
                <Badge variant={profile.is_verified ? 'success' : 'secondary'}>
                  {profile.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
                </Badge>
              }
            />
            <InfoItem
              icon={<Calendar className="h-4 w-4" />}
              label="Ngày tạo tài khoản"
              value={formatDate(profile.created_at)}
            />
            <InfoItem
              icon={<Clock className="h-4 w-4" />}
              label="Cập nhật lần cuối"
              value={formatDate(profile.updated_at)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  fullWidth?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, fullWidth = false }) => (
  <div className={cn('space-y-1', fullWidth && 'md:col-span-2')}>
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {label}
    </div>
    <div className="text-sm">
      {typeof value === 'string' ? (
        <span
          className={cn(!value || value === 'Chưa cập nhật' ? 'text-muted-foreground italic' : '')}
        >
          {value}
        </span>
      ) : (
        value
      )}
    </div>
  </div>
);

export default StudentProfileDisplay;

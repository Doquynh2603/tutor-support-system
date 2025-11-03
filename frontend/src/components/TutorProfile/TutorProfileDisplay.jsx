import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Edit,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TutorProfileDisplay = ({ profile, onEdit, isLoading }) => {
  // format ngày tháng năm
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // lấy tên địa chỉ - từ profile trực tiếp, không cần lookup
  const getLocationName = () => {
    if (!profile.ward_name) return 'Chưa cập nhật';
    return `${profile.ward_name}, ${profile.province_name}`;
  };

  // lấy ký tự đầu tên cho ảnh đại diện

  const getUserInitials = (name) => {
    if (!name) return 'NN';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profileImage} alt={profile.fullName || 'Profile'} />
                <AvatarFallback className="text-lg">
                  {getUserInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => {
                  /* Handle image upload */
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{profile.fullName || 'Chưa cập nhật tên'}</h2>
                <div className="flex gap-2">
                  {profile.verified ? (
                    <Badge variant="success" className="gap-1">
                      <Award className="h-3 w-3" />
                      Đã xác minh
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Chưa xác minh
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
              </div>

              {profile.introduction && (
                <p className="text-sm text-muted-foreground line-clamp-2">{profile.introduction}</p>
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
              value={formatDate(profile.dateOfBirth)}
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
            <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
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

      {/* Teaching Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Thông tin gia sư
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Award className="h-4 w-4" />}
              label="Số năm kinh nghiệm"
              value={profile.experienceYears ? `${profile.experienceYears} năm` : 'Chưa cập nhật'}
            />
            <InfoItem
              icon={<BookOpen className="h-4 w-4" />}
              label="Chuyên môn"
              value={profile.specialties || 'Chưa cập nhật'}
            />
          </div>

          {profile.teachingStyle && (
            <InfoItem
              icon={<GraduationCap className="h-4 w-4" />}
              label="Phong cách dạy học"
              value={profile.teachingStyle}
              fullWidth
            />
          )}

          {profile.introduction && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Giới thiệu bản thân
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.introduction}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
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
                <Badge variant={profile.verified ? 'success' : 'secondary'}>
                  {profile.verified ? 'Đã xác minh' : 'Chưa xác minh'}
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

// Helper component for displaying information items
const InfoItem = ({ icon, label, value, fullWidth = false }) => (
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

export default TutorProfileDisplay;

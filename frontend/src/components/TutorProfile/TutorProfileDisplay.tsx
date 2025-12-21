import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { TutorProfile } from '@/types';
import { Subject } from '@/types';
interface TutorProfileDisplayProps {
  profile: TutorProfile | null;
  onEdit?: () => void;
  isLoading?: boolean;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

const TutorProfileDisplay: React.FC<TutorProfileDisplayProps> = ({
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

  const getGenderDisplay = (gender?: boolean | null) => {
    if (gender === true) return 'Nam';
    if (gender === false) return 'Nữ';
    return 'Chưa xác định';
  };

  const getLocationName = () => {
    if (!profile?.province_name) return 'Chưa cập nhật';
    const parts = [profile.ward_name, profile.district_name, profile.province_name].filter(Boolean);
    return parts.join(', ');
  };

  // ✅ SỬA: Get subjects - đã là array of objects {subject_id, name}
  const getSubjectsArray = (): Subject[] => {
    if (!profile?.subjects) return [];

    // Nếu đã là array objects từ backend
    if (Array.isArray(profile.subjects)) {
      const first = profile.subjects[0];
      if (first && typeof first === 'object' && 'name' in first) {
        return profile.subjects as Subject[];
      }

      // Nếu vẫn là string IDs, parse JSON
      try {
        if (typeof first === 'string') {
          return JSON.parse(JSON.stringify(profile.subjects));
        }
      } catch (e) {
        console.warn('Lỗi parse subjects:', e);
      }
    }

    // Nếu là string JSON
    try {
      return typeof profile.subjects === 'string'
        ? JSON.parse(profile.subjects)
        : Array.isArray(profile.subjects)
          ? profile.subjects
          : [];
    } catch (e) {
      console.warn('Lỗi parse subjects JSON:', e);
      return [];
    }
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

  const subjectsArray = getSubjectsArray();
  console.log('📚 Subjects array:', subjectsArray);

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{profile.name || 'Chưa cập nhật tên'}</h2>
                <div className="flex gap-2">
                  {profile.is_verified ? (
                    <Badge variant="default" className="gap-1 bg-green-600">
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

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
              icon={<Users className="h-4 w-4" />}
              label="Giới tính"
              value={getGenderDisplay(profile.gender)}
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
              value={
                profile.experience_years !== undefined && profile.experience_years !== null
                  ? `${profile.experience_years} năm`
                  : 'Chưa cập nhật'
              }
            />
            <InfoItem
              icon={<Award className="h-4 w-4" />}
              label="Giá theo giờ"
              value={
                profile.hourly_rate
                  ? `${profile.hourly_rate.toLocaleString('vi-VN')} VND`
                  : 'Chưa cập nhật'
              }
            />
            <InfoItem
              icon={<Award className="h-4 w-4" />}
              label="Đánh giá trung bình"
              value={profile.avg_rating ? `${profile.avg_rating}/5 ⭐` : 'Chưa có đánh giá'}
            />
            <InfoItem
              icon={<Award className="h-4 w-4" />}
              label="Tổng số đánh giá"
              value={profile.total_reviews || '0'}
            />
          </div>

          {/* ✅ SỬA: Display subjects - hiển thị tên môn học */}
          {subjectsArray && subjectsArray.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Môn học dạy
              </div>
              <div className="flex flex-wrap gap-2">
                {subjectsArray.map((subject: Subject, index: number) => (
                  <Badge
                    key={`${subject.subject_id}-${index}`}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {/* ✅ Hiển thị tên môn học */}
                    {subject.name || subject.subject_id || 'Không xác định'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {profile.introduction && (
            <div className="space-y-2 border-t pt-4">
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
                <Badge variant={profile.is_verified ? 'default' : 'secondary'}>
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

export default TutorProfileDisplay;

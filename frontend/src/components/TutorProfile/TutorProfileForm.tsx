import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save, X, Loader2 } from 'lucide-react';
import { useProfileValidation } from '../../hooks/useTutorProfile';

import { TutorProfile } from '@/types';

interface Province {
  id: string | number;
  name: string;
}

interface District {
  id: string | number;
  name: string;
  province_id?: string | number;
}

interface Ward {
  id: string | number;
  name: string;
  district_id?: string | number;
  province_id?: string | number;
}

interface TutorProfileFormProps {
  profile: TutorProfile | null;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedProvinceId: string | null;
  selectedDistrictId: string | null;
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  onProvinceChange: (provinceId: string) => void;
  onDistrictChange: (districtId: string) => void;
  onSave: (data: Partial<TutorProfile>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  validationErrors?: Record<string, string>;
}

const TutorProfileForm: React.FC<TutorProfileFormProps> = ({
  profile,
  provinces,
  districts,
  wards,
  selectedProvinceId,
  selectedDistrictId,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  onProvinceChange,
  onDistrictChange,
  onSave,
  onCancel,
  isSubmitting = false,
  validationErrors = {},
}) => {
  const { validateProfile } = useProfileValidation();

  const [formData, setFormData] = useState<TutorProfile>({
    tutor_profile_id: '',
    user_id: '',
    name: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address_id: '',
    locationDetail: '',
    experience_years: '',
    introduction: '',
    specialties: '',
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        tutor_profile_id: profile.tutor_profile_id || '',
        user_id: profile.user_id || '',
        name: profile.name || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        phone: profile.phone || '',
        address_id: profile.address_id || '',
        experience_years: profile.experience_years || '',
        locationDetail: profile.locationDetail || '',
        introduction: profile.introduction || '',
        specialties: profile.specialties || '',
      });
      setIsDirty(false);
    }
  }, [profile]);

  const handleProvinceChangeLocal = (value: string) => {
    onProvinceChange(value);
    setFormData((prev) => ({ ...prev, address_id: '' }));
    setIsDirty(true);
  };

  const handleDistrictChangeLocal = (value: string) => {
    onDistrictChange(value);
    setFormData((prev) => ({ ...prev, address_id: '' }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // const allErrors = { ...validationErrors, ...localErrors };
  //   (ward) =>
  //     parseInt(ward.province_id.toString()) === parseInt(selectedProvinceId?.toString() || '0')
  // );

  // const allErrors = { ...validationErrors, ...localErrors };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  setIsDirty(true);
                }}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, phone: e.target.value }));
                  setIsDirty(true);
                }}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }));
                  setIsDirty(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Số năm kinh nghiệm</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, experience_years: e.target.value }));
                  setIsDirty(true);
                }}
                placeholder="Nhập số năm kinh nghiệm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin gia sư</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialties">Chuyên môn</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, specialties: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Ví dụ: Toán, Lý, Hóa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="introduction">Giới thiệu bản thân</Label>
            <Textarea
              id="introduction"
              value={formData.introduction}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, introduction: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Giới thiệu về bản thân, kinh nghiệm..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Địa chỉ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Tỉnh/Thành phố</Label>
              <Select
                value={selectedProvinceId || ''}
                onValueChange={handleProvinceChangeLocal}
                disabled={isLoadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={String(province.id)}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Select
                value={selectedDistrictId || ''}
                onValueChange={handleDistrictChangeLocal}
                disabled={!selectedProvinceId || isLoadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={String(district.id)}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <Select
                value={formData.address_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, address_id: value }));
                  setIsDirty(true);
                }}
                disabled={!selectedDistrictId || isLoadingWards}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={String(ward.id)}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationDetail">Địa chỉ chi tiết</Label>
            <Textarea
              id="locationDetail"
              value={formData.locationDetail}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, locationDetail: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Nhập địa chỉ chi tiết"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Hủy bỏ
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Lưu thông tin
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default TutorProfileForm;

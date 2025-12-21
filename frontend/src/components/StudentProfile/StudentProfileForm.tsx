import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Save, X, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { StudentProfile, Province, District, Ward } from '../../types';

interface StudentProfileFormProps {
  profile: StudentProfile | null;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  onSave: (data: Partial<StudentProfile>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isLoadingProvinces?: boolean;
  isLoadingDistricts?: boolean;
  isLoadingWards?: boolean;
  selectedProvinceId: string | null;
  selectedDistrictId: string | null;
  onProvinceChange: (provinceId: string | null) => void;
  onDistrictChange: (districtId: string | null) => void;
  validationErrors?: Record<string, string>;
}

const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  profile,
  provinces,
  districts,
  wards,
  onSave,
  onCancel,
  isSubmitting = false,
  isLoadingProvinces = false,
  isLoadingDistricts = false,
  isLoadingWards = false,
  selectedProvinceId,
  selectedDistrictId,
  onProvinceChange,
  onDistrictChange,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<StudentProfile>({
    student_id: '',
    user_id: '',
    name: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address_id: '',
    locationDetail: '',
    gradeLevel: null,
    school: '',
    gender: null,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        student_id: profile.student_id || '',
        user_id: profile.user_id || '',
        name: profile.name ?? '',
        email: profile.email ?? '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        phone: profile.phone ?? '',
        locationDetail: profile.locationDetail ?? '',
        address_id: profile.address_id ? String(profile.address_id) : '', // ✅ UUID string
        gradeLevel: profile.gradeLevel || null,
        school: profile.school ?? '',
        gender: profile.gender ?? null,
      });
      setIsDirty(false);
    }
  }, [profile]);

  const handleInputChange = (field: keyof StudentProfile, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ?? '',
    }));
    setIsDirty(true);
  };

  const handleGenderChange = (value: string) => {
    let genderValue: boolean | null = null;
    if (value === 'male') genderValue = true;
    else if (value === 'female') genderValue = false;

    setFormData((prev) => ({ ...prev, gender: genderValue }));
    setIsDirty(true);
  };

  const handleGradeLevelChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gradeLevel: value ? Number(value) : null,
    }));
    setIsDirty(true);
  };

  const handleProvinceChange = (value: string) => {
    onProvinceChange(value || null);
    setFormData((prev) => ({ ...prev, address_id: '' }));
    setIsDirty(true);
  };

  const handleDistrictChange = (value: string) => {
    onDistrictChange(value || null);
    setFormData((prev) => ({ ...prev, address_id: '' }));
    setIsDirty(true);
  };

  const handleWardChange = (value: string) => {
    setFormData((prev) => ({ ...prev, address_id: value ?? '' }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          {profile && profile['is_verified'] !== undefined && (
            <div className="flex gap-2 mt-2">
              {(profile['is_verified'] as boolean) ? (
                <Badge variant="success">Đã xác minh</Badge>
              ) : (
                <Badge variant="secondary">Chưa xác minh</Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={formData.name ?? ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập họ và tên"
                className={validationErrors.name ? 'border-red-500' : ''}
              />
              {validationErrors.name && (
                <p className="text-red-600 text-sm">{validationErrors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone ?? ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Nhập số điện thoại"
                className={validationErrors.phone ? 'border-red-500' : ''}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-sm">{validationErrors.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth ?? ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={validationErrors.dateOfBirth ? 'border-red-500' : ''}
              />
              {validationErrors.dateOfBirth && (
                <p className="text-red-600 text-sm">{validationErrors.dateOfBirth}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={
                  formData.gender === true ? 'male' : formData.gender === false ? 'female' : ''
                }
                onValueChange={handleGenderChange}
              >
                <SelectTrigger className={validationErrors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.gender && (
                <p className="text-red-600 text-sm">{validationErrors.gender}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutor Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin học tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* School */}
            <div className="space-y-2">
              <Label htmlFor="school">Trường học</Label>
              <Input
                id="school"
                value={formData.school ?? ''}
                onChange={(e) => handleInputChange('school', e.target.value)}
                placeholder="Nhập tên trường"
                className={validationErrors.school ? 'border-red-500' : ''}
              />
              {validationErrors.school && (
                <p className="text-red-600 text-sm">{validationErrors.school}</p>
              )}
            </div>

            {/* Grade Level */}
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Cấp lớp</Label>
              <Select
                value={formData.gradeLevel ? String(formData.gradeLevel) : ''}
                onValueChange={handleGradeLevelChange}
              >
                <SelectTrigger className={validationErrors.gradeLevel ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn cấp lớp" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((level) => (
                    <SelectItem key={`grade-${level}`} value={String(level)}>
                      Lớp {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.gradeLevel && (
                <p className="text-red-600 text-sm">{validationErrors.gradeLevel}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Địa chỉ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Province */}
            <div className="space-y-2">
              <Label htmlFor="province">Tỉnh/Thành phố</Label>
              <div className="text-xs text-gray-500 mb-1">📊 {provinces?.length || 0} items</div>
              <Select
                value={selectedProvinceId ?? ''} // ✅ UUID string
                onValueChange={handleProvinceChange}
                disabled={isLoadingProvinces}
              >
                <SelectTrigger className={validationErrors.province ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces && provinces.length > 0 ? (
                    provinces.map((province) => (
                      <SelectItem
                        key={`province-${province.id}`}
                        value={province.id} // ✅ UUID string
                      >
                        {province.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      {isLoadingProvinces ? '⏳ Đang tải...' : '❌ Không có dữ liệu'}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {validationErrors.province && (
                <p className="text-red-600 text-sm">{validationErrors.province}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <div className="text-xs text-gray-500 mb-1">📊 {districts?.length || 0} items</div>
              <Select
                value={selectedDistrictId ?? ''} // ✅ UUID string
                onValueChange={handleDistrictChange}
                disabled={!selectedProvinceId || isLoadingDistricts}
              >
                <SelectTrigger className={validationErrors.district ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts && districts.length > 0 ? (
                    districts.map((district) => (
                      <SelectItem
                        key={`district-${district.id}`}
                        value={district.id} // ✅ UUID string
                      >
                        {district.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      {!selectedProvinceId
                        ? '⚠️ Chọn tỉnh trước'
                        : isLoadingDistricts
                          ? '⏳ Đang tải...'
                          : '❌ Không có dữ liệu'}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {validationErrors.district && (
                <p className="text-red-600 text-sm">{validationErrors.district}</p>
              )}
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <div className="text-xs text-gray-500 mb-1">📊 {wards?.length || 0} items</div>
              <Select
                value={formData.address_id ?? ''} // ✅ UUID string
                onValueChange={handleWardChange}
                disabled={!selectedDistrictId || isLoadingWards}
              >
                <SelectTrigger className={validationErrors.ward ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards && wards.length > 0 ? (
                    wards.map((ward) => (
                      <SelectItem
                        key={`ward-${ward.id}`}
                        value={ward.id} // ✅ UUID string
                      >
                        {ward.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      {!selectedDistrictId
                        ? '⚠️ Chọn huyện trước'
                        : isLoadingWards
                          ? '⏳ Đang tải...'
                          : '❌ Không có dữ liệu'}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {validationErrors.ward && (
                <p className="text-red-600 text-sm">{validationErrors.ward}</p>
              )}
            </div>
          </div>

          {/* Location Detail */}
          <div className="space-y-2">
            <Label htmlFor="locationDetail">Địa chỉ chi tiết</Label>
            <Textarea
              id="locationDetail"
              value={formData.locationDetail ?? ''}
              onChange={(e) => handleInputChange('locationDetail', e.target.value)}
              placeholder="Nhập địa chỉ chi tiết"
              rows={2}
              className={validationErrors.locationDetail ? 'border-red-500' : ''}
            />
            {validationErrors.locationDetail && (
              <p className="text-red-600 text-sm">{validationErrors.locationDetail}</p>
            )}
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

export default StudentProfileForm;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Save, X, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { StudentProfile } from '../../types';

interface District {
  id: number;
  name: string;
  province_id?: number;
}

interface Ward {
  id: number;
  name: string;
  district_id?: number;
}

interface Province {
  id: number;
  name: string;
}

interface StudentProfileFormProps {
  profile: StudentProfile | undefined;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  onSave: (data: Partial<StudentProfile>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isLoadingProvinces?: boolean;
  isLoadingDistricts?: boolean;
  isLoadingWards?: boolean;
  selectedProvinceId: number | null;
  selectedDistrictId: number | null;
  onProvinceChange: (provinceId: number | null) => void;
  onDistrictChange: (districtId: number | null) => void;
  validationErrors?: Record<string, string>;
}

// interface FormData {
//   fullName: string;
//   dateOfBirth: string;
//   phone: string;
//   province_id: string;
//   address_id: string;
//   locationDetail: string;
//   gradeLevel: string;
//   school: string;
// }

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
    student_profile_id: '',
    user_id: '',
    name: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address_id: '',
    locationDetail: '',
    gradeLevel: '',
    school: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    if (profile) {
      setFormData({
        student_profile_id: profile.student_profile_id || '',
        user_id: profile.user_id || '',
        name: profile.name || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        phone: profile.phone || '',
        locationDetail: profile.locationDetail || '',
        address_id: profile.address_id || '',
        gradeLevel: profile['gradeLevel']?.toString() || '',
        school: profile.school || '',
      });
      setIsDirty(false);
    }
  }, [profile]);

  // ✅ Fixed handleChange type

  const handleProvinceChange = (value: string) => {
    const provinceId = value ? Number(value) : null;
    onProvinceChange(provinceId);
    setFormData((prev) => ({ ...prev, address_id: '' }));
    setIsDirty(true);
  };

  const handleDistrictChange = (value: string) => {
    const districtId = value ? Number(value) : null;
    onDistrictChange(districtId);
    setFormData((prev) => ({ ...prev, address_id: '' }));
    setIsDirty(true);
  };

  const handleWardChange = (value: string) => {
    setFormData((prev) => ({ ...prev, address_id: value }));
    setIsDirty(true);
  };

  // const validateForm = (): boolean => {
  //   const errors: ValidationErrors = {};
  //   if (!formData.fullName?.trim()) errors.fullName = 'Tên không được để trống';
  //   if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, '')))
  //     errors.phone = 'Số điện thoại không hợp lệ (10-15 chữ số)';
  //   if (
  //     formData.gradeLevel &&
  //     (Number(formData.gradeLevel) < 1 || Number(formData.gradeLevel) > 12)
  //   )
  //     errors.gradeLevel = 'Khối lớp phải từ 1 đến 12';

  //   setLocalErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // const dataToSubmit: Partial<StudentProfile> = {
    //   fullName: formData.fullName,
    //   dateOfBirth: formData.dateOfBirth,
    //   phone: formData.phone,
    //   locationDetail: formData.locationDetail,
    //   province_id: formData.province_id,
    //   address_id: formData.address_id,
    //   gradeLevel: formData.gradeLevel !== '' ? Number(formData.gradeLevel) : undefined,
    //   school: formData.school,
    // };

    // // Remove empty or undefined values
    // Object.keys(dataToSubmit).forEach((key) => {
    //   if (
    //     dataToSubmit[key as keyof StudentProfile] === '' ||
    //     dataToSubmit[key as keyof StudentProfile] === undefined
    //   ) {
    //     delete dataToSubmit[key as keyof StudentProfile];
    //   }
    // });

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
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin gia sư</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          <Label htmlFor="school">Trường học</Label>
          <Input
            id="school"
            value={formData.school}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, school: e.target.value }));
              setIsDirty(true);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gradeLevel">Lớp</Label>
          <Input
            id="gradeLevel"
            value={formData.gradeLevel}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, gradeLevel: e.target.value }));
              setIsDirty(true);
            }}
          />
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Địa chỉ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Tỉnh/Thành phố</Label>
              <Select
                value={selectedProvinceId?.toString() || ''}
                onValueChange={handleProvinceChange}
                disabled={isLoadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id.toString()}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Select
                value={selectedDistrictId?.toString() || ''}
                onValueChange={handleDistrictChange}
                disabled={!selectedProvinceId || isLoadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id.toString()}>
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
                onValueChange={handleWardChange}
                disabled={!selectedDistrictId || isLoadingWards}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id.toString()}>
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

export default StudentProfileForm;

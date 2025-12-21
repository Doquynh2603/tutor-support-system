import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Save, X, Loader2 } from 'lucide-react';
import { useProfileValidation } from '../../hooks/useTutorProfile';

import { TutorProfile, Province, District, Ward, Subject } from '@/types';

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
  subjects?: Subject[];
  isLoadingSubjects?: boolean;
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
  subjects = [],
  isLoadingSubjects = false,
}) => {
  const { validateProfile } = useProfileValidation();

  const [formData, setFormData] = useState<TutorProfile>({
    tutor_id: '',
    user_id: '',
    name: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    address_id: '',
    locationDetail: '',
    experience_years: 0,
    introduction: '',
    subjects: [],
    gender: null,
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // ✅ SỬA: Parse subjects từ profile - hỗ trợ cả string JSON và array objects
  const parseSubjectsFromProfile = (profileSubjects: any): string[] => {
    if (!profileSubjects) return [];

    try {
      // Nếu là array of objects {subject_id, name}
      if (Array.isArray(profileSubjects)) {
        const first = profileSubjects[0];
        if (first && typeof first === 'object' && 'subject_id' in first) {
          console.log('✅ Subjects là array objects, extracting IDs:', profileSubjects);
          return profileSubjects.map((s: any) => s.subject_id);
        }
        // Nếu là array of strings
        if (typeof first === 'string') {
          console.log('✅ Subjects là array strings:', profileSubjects);
          return profileSubjects;
        }
      }

      // Nếu là string JSON
      if (typeof profileSubjects === 'string') {
        const parsed = JSON.parse(profileSubjects);
        console.log('✅ Subjects parsed from JSON:', parsed);
        return Array.isArray(parsed) ? parsed : [];
      }

      return [];
    } catch (e) {
      console.warn('⚠️ Lỗi parse subjects:', e);
      return [];
    }
  };

  useEffect(() => {
    if (profile) {
      console.log('📝 [TutorProfileForm] Setting form data from profile');
      console.log('   - Profile subjects:', profile.subjects);

      // ✅ Parse subjects - support all formats
      const subjectsArray = parseSubjectsFromProfile(profile.subjects);
      console.log('   - Parsed subject IDs:', subjectsArray);

      setFormData({
        tutor_id: profile.tutor_id || '',
        user_id: profile.user_id || '',
        name: profile.name || '',
        email: profile.email || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        phone: profile.phone || '',
        address_id: profile.address_id || '',
        experience_years: profile.experience_years || 0,
        locationDetail: profile.locationDetail || '',
        introduction: profile.introduction || '',
        subjects: subjectsArray, // ✅ Set as array of IDs
        gender: profile.gender ?? null,
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

  // ✅ Handle subject checkbox change
  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    console.log(`📝 Subject ${subjectId} changed to ${checked}`);
    setFormData((prev) => {
      const updatedSubjects = checked
        ? [...(prev.subjects || []), subjectId]
        : (prev.subjects || []).filter((id) => id !== subjectId);

      console.log('   - Updated subjects:', updatedSubjects);
      return { ...prev, subjects: updatedSubjects };
    });
    setIsDirty(true);
  };

  // ✅ Check if subject is selected
  const isSubjectChecked = (subjectId: string): boolean => {
    const isChecked = (formData.subjects || []).includes(subjectId);
    return isChecked;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 [handleSubmit] Submitting form data:', formData);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
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
              {validationErrors.name && (
                <p className="text-red-600 text-sm">{validationErrors.name}</p>
              )}
            </div>

            {/* Phone */}
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
                value={formData.dateOfBirth}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }));
                  setIsDirty(true);
                }}
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
                onValueChange={(value) => {
                  const genderValue = value === 'male' ? true : value === 'female' ? false : null;
                  setFormData((prev) => ({ ...prev, gender: genderValue }));
                  setIsDirty(true);
                }}
              >
                <SelectTrigger>
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

            {/* Experience Years */}
            <div className="space-y-2">
              <Label htmlFor="experience_years">Số năm kinh nghiệm</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    experience_years: parseInt(e.target.value) || 0,
                  }));
                  setIsDirty(true);
                }}
                placeholder="Nhập số năm kinh nghiệm"
                min="0"
                max="60"
              />
              {validationErrors.experience_years && (
                <p className="text-red-600 text-sm">{validationErrors.experience_years}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
                placeholder="Email"
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
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{formData.introduction.length}/1000 ký tự</p>
            {validationErrors.introduction && (
              <p className="text-red-600 text-sm">{validationErrors.introduction}</p>
            )}
          </div>

          {/* ✅ SỬA: Subjects Checkboxes - auto-check based on profile */}
          <div className="space-y-3">
            <Label>Môn học dạy</Label>
            <p className="text-sm text-gray-600">Chọn các môn học bạn dạy</p>

            {isLoadingSubjects ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Đang tải danh sách môn học...</span>
              </div>
            ) : subjects && subjects.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 border rounded-lg bg-gray-50">
                {subjects.map((subject: Subject) => {
                  // ✅ Check nếu subject_id có trong formData.subjects
                  const isChecked = isSubjectChecked(subject.subject_id);

                  return (
                    <div key={subject.subject_id} className="flex items-center gap-2">
                      <Checkbox
                        id={`subject-${subject.subject_id}`}
                        checked={isChecked} // ✅ Auto-checked từ profile
                        onCheckedChange={(checked) =>
                          handleSubjectChange(subject.subject_id, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`subject-${subject.subject_id}`}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {subject.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-red-500">Không có môn học nào</p>
            )}

            <p className="text-xs text-gray-600 mt-2">
              ✅ Đã chọn: {(formData.subjects || []).length} môn học
            </p>
            {validationErrors.subjects && (
              <p className="text-red-600 text-sm">{validationErrors.subjects}</p>
            )}
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
            {/* Province */}
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
              {validationErrors.province_id && (
                <p className="text-red-600 text-sm">{validationErrors.province_id}</p>
              )}
            </div>

            {/* District */}
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
              {validationErrors.district_id && (
                <p className="text-red-600 text-sm">{validationErrors.district_id}</p>
              )}
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <Select
                value={formData.address_id || ''}
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
              {validationErrors.address_id && (
                <p className="text-red-600 text-sm">{validationErrors.address_id}</p>
              )}
            </div>
          </div>

          {/* Location Detail */}
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
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.locationDetail.length}/500 ký tự</p>
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

export default TutorProfileForm;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Save,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProfileValidation,
  useProvinces,
  useWardsByProvince,
} from '../../hooks/useTutorProfile';

const TutorProfileForm = ({ profile, onSave, onCancel, isLoading, validationErrors = {} }) => {
  const { validateProfile } = useProfileValidation();

  //trạng thái của form
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    provinceId: '',
    wardId: '',
    locationDetail: '',
    introduction: '',
    experienceYears: '',
    teachingStyle: '',
    specialties: '',
  });

  const [localErrors, setLocalErrors] = useState({});
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);

  // theo dõi trạng thái thay đổi của form
  const [isDirty, setIsDirty] = useState(false);

  // Fetch provinces and wards (cascading)
  const { data: provinces = [], isLoading: provincesLoading } = useProvinces(true);
  const { data: wards = [], isLoading: wardsLoading } = useWardsByProvince(
    selectedProvinceId,
    !!selectedProvinceId
  );

  //khởi tạo dữ liệu của form khi profile được tải
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        phone: profile.phone || '',
        provinceId: profile.provinceId || '',
        wardId: profile.wardId || '',
        locationDetail: profile.locationDetail || '',
        introduction: profile.introduction || '',
        experienceYears: profile.experienceYears || 0,
        teachingStyle: profile.teachingStyle || '',
        specialties: profile.specialties || '',
      });
      setSelectedProvinceId(profile.provinceId || null);
      setIsDirty(false);
    }
  }, [profile]);

  // xử lý thay đổi dữ liệu form
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
    // xóa lỗi cục bộ khi người dùng sửa trường
    if (localErrors[name] || validationErrors[name]) {
      setLocalErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle province change (cascading)
  const handleProvinceChange = (value) => {
    const provinceId = parseInt(value) || null;
    setSelectedProvinceId(provinceId);
    handleChange('provinceId', provinceId);
    handleChange('wardId', ''); // Reset ward when province changes
  };

  // xử lý lưu dữ liệu form
  const handleSubmit = (e) => {
    e.preventDefault();
    const { errors, isValid } = validateProfile(formData);
    if (!isValid) {
      setLocalErrors(errors);
      return;
    }

    const dataToSubmit = {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      provinceId: formData.provinceId ? parseInt(formData.provinceId) : null,
      wardId: formData.wardId ? parseInt(formData.wardId) : null,
      locationDetail: formData.locationDetail,
      introduction: formData.introduction,
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
      teachingStyle: formData.teachingStyle,
      specialties: formData.specialties,
    };

    // Remove empty values
    Object.keys(dataToSubmit).forEach((key) => {
      if (dataToSubmit[key] === '' || dataToSubmit[key] === null) {
        delete dataToSubmit[key];
      }
    });

    onSave(dataToSubmit);
  };

  // kết hợp lỗi xác thực từ server và lỗi cục bộ
  const allErrors = { ...validationErrors, ...localErrors };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chỉnh sửa thông tin cá nhân
          </CardTitle>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Chỉ cần điền những thông tin bạn muốn thay đổi</AlertDescription>
          </Alert>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <FormField
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={allErrors.fullName}
              placeholder="Nhập họ và tên"
              disabled={isLoading}
            />

            {/* Date of Birth */}
            <FormField
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={allErrors.dateOfBirth}
              disabled={isLoading}
            />

            {/* Phone */}
            <FormField
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={allErrors.phone}
              placeholder="Nhập số điện thoại"
              disabled={isLoading}
            />
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
          {/* Province Selection */}
          <div className="space-y-2">
            <Label htmlFor="provinceId">Tỉnh/Thành Phố</Label>
            <Select
              value={formData.provinceId?.toString() || ''}
              onValueChange={handleProvinceChange}
              disabled={isLoading || provincesLoading}
            >
              <SelectTrigger className={cn(allErrors.provinceId && 'border-red-500')}>
                <SelectValue placeholder="-- Chọn tỉnh/thành phố --" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allErrors.provinceId && <p className="text-sm text-red-500">{allErrors.provinceId}</p>}
          </div>

          {/* Ward Selection (Cascading - enabled only after province selected) */}
          <div className="space-y-2">
            <Label htmlFor="wardId">Quận/Huyện</Label>
            <Select
              value={formData.wardId?.toString() || ''}
              onValueChange={(value) => handleChange('wardId', value)}
              disabled={isLoading || wardsLoading || !selectedProvinceId}
            >
              <SelectTrigger className={cn(allErrors.wardId && 'border-red-500')}>
                <SelectValue
                  placeholder={
                    selectedProvinceId ? '-- Chọn quận/huyện --' : '-- Chọn tỉnh trước --'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id.toString()}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allErrors.wardId && <p className="text-sm text-red-500">{allErrors.wardId}</p>}
          </div>

          {/* Location Detail */}
          <FormField
            label="Địa chỉ chi tiết"
            name="locationDetail"
            value={formData.locationDetail}
            onChange={handleChange}
            error={allErrors.locationDetail}
            placeholder="Số nhà, tên đường..."
            disabled={isLoading}
            maxLength={500}
            showCharCount
          />
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
          {/* Experience Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Số năm kinh nghiệm"
              name="experienceYears"
              type="number"
              min="0"
              max="50"
              value={formData.experienceYears}
              onChange={handleChange}
              error={allErrors.experienceYears}
              placeholder="0"
              disabled={isLoading}
            />
          </div>

          {/* Specialties */}
          <FormField
            label="Chuyên môn"
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            error={allErrors.specialties}
            placeholder="VD: Toán học, Vật lý, Hóa học..."
            disabled={isLoading}
            maxLength={500}
            showCharCount
          />

          {/* Teaching Style */}
          <FormField
            label="Phong cách dạy học"
            name="teachingStyle"
            as="textarea"
            rows={3}
            value={formData.teachingStyle}
            onChange={handleChange}
            error={allErrors.teachingStyle}
            placeholder="Mô tả phong cách dạy học của bạn..."
            disabled={isLoading}
            maxLength={500}
            showCharCount
          />

          {/* Introduction */}
          <FormField
            label="Giới thiệu bản thân"
            name="introduction"
            as="textarea"
            rows={4}
            value={formData.introduction}
            onChange={handleChange}
            error={allErrors.introduction}
            placeholder="Giới thiệu về bản thân, kinh nghiệm, thành tích..."
            disabled={isLoading}
            maxLength={1000}
            showCharCount
          />
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
              disabled={isLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isLoading || !isDirty} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thông tin
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

//thành phần trường form tái sử dụng
const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  as = 'input',
  maxLength,
  showCharCount,
  ...props
}) => {
  const Component = as === 'textarea' ? Textarea : Input;
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Component
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={cn(error && 'border-red-500')}
        disabled={disabled}
        maxLength={maxLength}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {showCharCount && maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength} ký tự
        </p>
      )}
    </div>
  );
};
export default TutorProfileForm;

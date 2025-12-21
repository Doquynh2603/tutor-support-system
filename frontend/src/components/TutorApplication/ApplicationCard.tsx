import { Application, ApplicationListItem } from '@/types';
import { useState } from 'react';
import { Button } from '../ui';
import { BookOpen, ChevronDown, ChevronUp, Clock, MapPin, User } from 'lucide-react';
import { applicationAPI } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface ApplicationCardProps {
  application: ApplicationListItem;
  isExpanded: boolean;
  onToggleExpand: (application_id: string) => void;
  onWithdraw: (application_id: string) => void;
  onConfirm: (application_id: string) => void;
  onDecline: (application_id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'class_cancelled':
    case 'invitation_cancelled':
    case 'rejected':
    case 'withdrawn':
      return 'bg-red-100 text-red-800';
    case 'invited':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ApplicationCard({
  application,
  isExpanded,
  onToggleExpand,
  onWithdraw,
  onConfirm,
  onDecline,
}: ApplicationCardProps) {
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['applicationDetail', application.application_id],
    queryFn: () => applicationAPI.getApplicationDetail(application.application_id),
    enabled: isExpanded,
  });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {application.subject_name} - Lớp {application.classLevel}
          </h3>
          <h4 className="text-sm text-gray-600 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Địa điểm
          </h4>
          <p className="text-sm text-gray-600">
            {application.classLocation}, {application.ward_name}, {application.district_name},{' '}
            {application.province_name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {(application.application_status === 'approved' ||
            application.application_status === 'invited') && (
            <>
              {application.isConfirmed === null && (
                <>
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Xác nhận
                  </Button>
                  <Button
                    onClick={() => setShowDeclineModal(true)}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Từ chối
                  </Button>
                </>
              )}
              {application.isConfirmed === true && (
                <div className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                  ✅ Đã nhận lớp
                </div>
              )}
              {application.isConfirmed === false && (
                <div className="px-3 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium">
                  ❌ Đã từ chối
                </div>
              )}
            </>
          )}
          {application.application_status === 'applied' && (
            <Button
              onClick={() => setShowWithdrawModal(true)}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Rút đơn
            </Button>
          )}
          <Button
            onClick={() => onToggleExpand(application.application_id)}
            variant="ghost"
            className="p-2"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          {detailLoading ? (
            <p className="text-sm text-gray-600">Đang tải chi tiết...</p>
          ) : detail ? (
            <>
              {/* Hiển thị data từ detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Thông tin học viên
                  </h4>
                  <p className="text-sm text-gray-600">Tên: {detail?.student_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    Giới tính:{' '}
                    {detail?.gender == true
                      ? 'Nam'
                      : detail?.gender == false
                        ? 'Nữ'
                        : 'Chưa xác định'}
                  </p>
                  <p className="text-sm text-gray-600">Email: {detail?.student_email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    Điện thoại: {detail?.student_phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Thông tin lớp học
                  </h4>
                  <p className="text-sm text-gray-600">
                    Thời gian học: {dayjs.utc(detail?.start_date || '').format('DD/MM/YYYY')}-
                    {dayjs.utc(detail?.end_date || '').format('DD/MM/YYYY')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Giá: {detail?.hourly_price || 'N/A'} VNĐ/giờ
                  </p>
                  <p className="text-sm text-gray-600">Mô tả: {detail?.description || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Yêu cầu
                </h4>
                <p className="text-sm text-gray-600">
                  {detail?.requirement || 'Không có yêu cầu đặc biệt'}
                </p>
              </div>

              {(application.application_status === 'withdrawn' ||
                application.application_status === 'rejected' ||
                application.application_status === 'class_cancelled' ||
                application.application_status === 'invitation_cancelled') && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Lý do
                  </h4>
                  <p className="text-sm text-gray-700">
                    {application.application_status === 'withdrawn' && detail?.withdrawReason
                      ? detail.withdrawReason
                      : application.application_status === 'rejected' ||
                          application.application_status === 'invitation_cancelled'
                        ? detail?.declineReason || 'Không có lý do được cung cấp'
                        : application.application_status === 'class_cancelled'
                          ? detail?.cancellation_reason || 'Không có lý do được cung cấp'
                          : 'Không có lý do được cung cấp'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-600">Không thể tải chi tiết</p>
          )}
        </div>
      )}

      {/* Modal Withdraw */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rút đơn ứng tuyển</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn rút đơn ứng tuyển cho lớp này không?
            </p>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowWithdrawModal(false)} variant="outline">
                Hủy
              </Button>
              <Button
                onClick={() => {
                  onWithdraw(application.application_id);
                  setShowWithdrawModal(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Rút đơn
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Class */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận lớp học</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn xác nhận lớp học này không?
            </p>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowConfirmModal(false)} variant="outline">
                Hủy
              </Button>
              <Button
                onClick={() => {
                  onConfirm(application.application_id);
                  setShowConfirmModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Decline */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Từ chối lớp học</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn từ chối lớp học này không?
            </p>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowDeclineModal(false)} variant="outline">
                Hủy
              </Button>
              <Button
                onClick={() => {
                  onDecline(application.application_id);
                  setShowDeclineModal(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

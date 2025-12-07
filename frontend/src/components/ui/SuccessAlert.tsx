import React from 'react';

interface SuccessAlertProps {
  title?: string;
  message?: string;
  onDismiss?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({
  title = 'Thành Công',
  message = 'Thao tác thành công',
  onDismiss,
}) => {
  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl text-green-500">✅</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-green-800">{title}</h3>
          <p className="mt-2 text-sm text-green-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-green-400 hover:text-green-600 transition"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessAlert;

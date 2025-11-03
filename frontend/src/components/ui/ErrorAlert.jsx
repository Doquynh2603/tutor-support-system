/**
 * File: components/ui/ErrorAlert.jsx
 * Mục đích: Error alert component
 */

import React from 'react';

const ErrorAlert = ({ title = 'Lỗi', message = 'Đã xảy ra lỗi', onDismiss }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl text-red-500">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800">{title}</h3>
          <p className="mt-2 text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-2 text-red-400 hover:text-red-600 transition">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;

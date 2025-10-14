/**
 * File: main.tsx
 * Mục đích: Entry point của React application
 * Vai trò:
 *   - Mount React app vào DOM
 *   - Wrap app với StrictMode để detect potential problems
 * Lưu ý:
 *   - File này chạy đầu tiên khi app khởi động
 *   - StrictMode chỉ chạy ở development, không ảnh hưởng production
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * File: main.jsx
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
import App from './App.jsx';
import './index.css';
import { initializeAppStorage } from './lib/storageUtils.js';

// Initialize storage before rendering app
try {
  initializeAppStorage();
  console.log('✅ App storage initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize app storage:', error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);

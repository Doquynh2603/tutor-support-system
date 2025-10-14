/**
 * File: vite.config.ts
 * Mục đích: Cấu hình Vite build tool
 * Vai trò:
 *   - Setup Vite plugins và build options
 *   - Cấu hình path alias (@/ -> ./src/)
 *   - Setup dev server và proxy
 * Lưu ý:
 *   - React plugin cần cho JSX/TSX support
 *   - Path alias @ phải match với tsconfig.json
 *   - Proxy API requests đến backend ở development
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @ -> src/
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy /api requests đến backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

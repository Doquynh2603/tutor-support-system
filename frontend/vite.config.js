/**
 * File: vite.config.js
 * Mục đích: Cấu hình Vite build tool (JavaScript version)
 * Vai trò:
 *   - Setup Vite plugins và build options
 *   - Cấu hình path alias (@/ -> ./src/)
 *   - Setup dev server
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Hỗ trợ JSX trong .js files
      include: '**/*.{jsx,js}',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'), // @ -> src/
    },
    extensions: ['.js', '.jsx', '.json'], // Hỗ trợ .jsx files
  },
  server: {
    port: 5173, // Vite default port
    proxy: {
      // Proxy /api requests đến backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html'),
      },
    },
    sourcemap: true, // Enable source maps for debugging
  },
  define: {
    // Define global constants
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});

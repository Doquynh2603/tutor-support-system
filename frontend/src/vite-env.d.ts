/**
 * File: vite-env.d.ts
 * Mục đích: TypeScript type definitions cho Vite environment
 * Vai trò:
 *   - Định nghĩa types cho import.meta.env
 *   - Thêm intellisense cho environment variables
 * Lưu ý:
 *   - Vite env variables phải có prefix VITE_
 *   - Thêm mới env variables vào interface ImportMetaEnv
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  // Thêm env variables khác ở đây
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

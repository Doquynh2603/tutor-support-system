/**
 * File: lib/utils.ts
 * Mục đích: Utility function cho shadcn/ui
 * Vai trò:
 *   - Merge Tailwind CSS classes một cách thông minh
 *   - Tránh conflict giữa các classes
 * Lưu ý:
 *   - Function này được sử dụng trong tất cả shadcn/ui components
 *   - clsx: merge conditional classes
 *   - twMerge: merge và deduplicate Tailwind classes
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge và deduplicate Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

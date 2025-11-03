/**
 * File: lib/utils.js
 * Mục đích: Utility function cho shadcn/ui components
 * Vai trò:
 *   - Merge Tailwind CSS classes một cách thông minh
 *   - Tránh conflict giữa các classes
 * Lưu ý:
 *   - Function này được sử dụng trong tất cả shadcn/ui components
 *   - clsx: merge conditional classes
 *   - twMerge: merge và deduplicate Tailwind classes
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge và deduplicate Tailwind CSS classes
 * @param {...any} inputs - Class values to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

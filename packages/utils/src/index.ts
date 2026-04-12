import type { PaginationMeta, PaginationParams } from '@retail-saas/types';

// ================================================
// @retail-saas/utils - Shared Utility Functions
// ================================================

// ---- String Utilities ----

/**
 * Chuyển chuỗi thành slug (lowercase, dashes)
 * @example slugify('My Store Name') => 'my-store-name'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Thay spaces bằng -
    .replace(/[^\w-]+/g, '')     // Xóa ký tự không hợp lệ
    .replace(/--+/g, '-')        // Thay nhiều -- bằng -
    .replace(/^-+/, '')           // Xóa - ở đầu
    .replace(/-+$/, '');          // Xóa - ở cuối
}

/**
 * Tạo schema name từ tenant slug
 * @example toSchemaName('my-store') => 'tenant_my_store'
 */
export function toSchemaName(slug: string): string {
  return `tenant_${slug.replace(/-/g, '_')}`;
}

/**
 * Capitalize chuỗi đầu tiên
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ---- Pagination Utilities ----

/**
 * Tạo pagination params chuẩn với default values
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page || 1),
    limit: Math.min(100, Math.max(1, params.limit || 20)),
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  };
}

/**
 * Tạo PaginationMeta từ total và params
 */
export function buildPaginationMeta(
  total: number,
  params: Required<PaginationParams>,
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);
  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}

/**
 * Tính offset cho database query
 */
export function calcOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// ---- Date Utilities ----

/**
 * Format date sang ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Kiểm tra date có hợp lệ không
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

// ---- Object Utilities ----

/**
 * Xóa các key có value undefined hoặc null
 */
export function removeNullish<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null),
  ) as Partial<T>;
}

/**
 * Deep clone object (JSON serializable chỉ)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---- Validation Utilities ----

/**
 * Kiểm tra email hợp lệ
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Kiểm tra slug hợp lệ (chỉ lowercase, numbers, dashes)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ---- Error Utilities ----

/**
 * Tạo error code chuẩn từ class name
 * @example getErrorCode('NotFoundException') => 'NOT_FOUND'
 */
export function getErrorCode(errorName: string): string {
  return errorName
    .replace(/Exception$/, '')
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '');
}

// ---- ID Utilities ----

/**
 * Generate UUID v4 đơn giản (dùng crypto nếu có)
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

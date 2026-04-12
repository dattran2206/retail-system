import type { PaginationMeta, PaginationParams } from '@retail-saas/types';
/**
 * Chuyển chuỗi thành slug (lowercase, dashes)
 * @example slugify('My Store Name') => 'my-store-name'
 */
export declare function slugify(text: string): string;
/**
 * Tạo schema name từ tenant slug
 * @example toSchemaName('my-store') => 'tenant_my_store'
 */
export declare function toSchemaName(slug: string): string;
/**
 * Capitalize chuỗi đầu tiên
 */
export declare function capitalize(str: string): string;
/**
 * Tạo pagination params chuẩn với default values
 */
export declare function normalizePaginationParams(params: PaginationParams): Required<PaginationParams>;
/**
 * Tạo PaginationMeta từ total và params
 */
export declare function buildPaginationMeta(total: number, params: Required<PaginationParams>): PaginationMeta;
/**
 * Tính offset cho database query
 */
export declare function calcOffset(page: number, limit: number): number;
/**
 * Format date sang ISO string
 */
export declare function formatDate(date: Date): string;
/**
 * Kiểm tra date có hợp lệ không
 */
export declare function isValidDate(date: unknown): date is Date;
/**
 * Xóa các key có value undefined hoặc null
 */
export declare function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T>;
/**
 * Deep clone object (JSON serializable chỉ)
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Kiểm tra email hợp lệ
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Kiểm tra slug hợp lệ (chỉ lowercase, numbers, dashes)
 */
export declare function isValidSlug(slug: string): boolean;
/**
 * Tạo error code chuẩn từ class name
 * @example getErrorCode('NotFoundException') => 'NOT_FOUND'
 */
export declare function getErrorCode(errorName: string): string;
/**
 * Generate UUID v4 đơn giản (dùng crypto nếu có)
 */
export declare function generateId(): string;
//# sourceMappingURL=index.d.ts.map
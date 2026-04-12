"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.toSchemaName = toSchemaName;
exports.capitalize = capitalize;
exports.normalizePaginationParams = normalizePaginationParams;
exports.buildPaginationMeta = buildPaginationMeta;
exports.calcOffset = calcOffset;
exports.formatDate = formatDate;
exports.isValidDate = isValidDate;
exports.removeNullish = removeNullish;
exports.deepClone = deepClone;
exports.isValidEmail = isValidEmail;
exports.isValidSlug = isValidSlug;
exports.getErrorCode = getErrorCode;
exports.generateId = generateId;
// ================================================
// @retail-saas/utils - Shared Utility Functions
// ================================================
// ---- String Utilities ----
/**
 * Chuyển chuỗi thành slug (lowercase, dashes)
 * @example slugify('My Store Name') => 'my-store-name'
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Thay spaces bằng -
        .replace(/[^\w-]+/g, '') // Xóa ký tự không hợp lệ
        .replace(/--+/g, '-') // Thay nhiều -- bằng -
        .replace(/^-+/, '') // Xóa - ở đầu
        .replace(/-+$/, ''); // Xóa - ở cuối
}
/**
 * Tạo schema name từ tenant slug
 * @example toSchemaName('my-store') => 'tenant_my_store'
 */
function toSchemaName(slug) {
    return `tenant_${slug.replace(/-/g, '_')}`;
}
/**
 * Capitalize chuỗi đầu tiên
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
// ---- Pagination Utilities ----
/**
 * Tạo pagination params chuẩn với default values
 */
function normalizePaginationParams(params) {
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
function buildPaginationMeta(total, params) {
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
function calcOffset(page, limit) {
    return (page - 1) * limit;
}
// ---- Date Utilities ----
/**
 * Format date sang ISO string
 */
function formatDate(date) {
    return date.toISOString();
}
/**
 * Kiểm tra date có hợp lệ không
 */
function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}
// ---- Object Utilities ----
/**
 * Xóa các key có value undefined hoặc null
 */
function removeNullish(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
}
/**
 * Deep clone object (JSON serializable chỉ)
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// ---- Validation Utilities ----
/**
 * Kiểm tra email hợp lệ
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Kiểm tra slug hợp lệ (chỉ lowercase, numbers, dashes)
 */
function isValidSlug(slug) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
// ---- Error Utilities ----
/**
 * Tạo error code chuẩn từ class name
 * @example getErrorCode('NotFoundException') => 'NOT_FOUND'
 */
function getErrorCode(errorName) {
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
function generateId() {
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
//# sourceMappingURL=index.js.map
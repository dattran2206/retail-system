export declare enum TenantStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    PENDING = "PENDING"
}
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    TENANT_ADMIN = "TENANT_ADMIN",
    MANAGER = "MANAGER",
    CASHIER = "CASHIER",
    VIEWER = "VIEWER"
}
export declare enum PlanName {
    FREE = "FREE",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export interface Plan {
    id: string;
    name: PlanName;
    displayName: string;
    price: number;
    features: PlanFeatures;
    createdAt: Date;
}
export interface PlanFeatures {
    maxUsers: number;
    maxProducts: number;
    maxBranches: number;
    hasAnalytics: boolean;
    hasAPI: boolean;
    supportLevel: 'community' | 'email' | 'priority';
}
export interface Tenant {
    id: string;
    slug: string;
    name: string;
    schemaName: string;
    status: TenantStatus;
    planId: string;
    plan?: Plan;
    createdAt: Date;
    updatedAt: Date;
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    meta?: PaginationMeta;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    tenantId: string;
    tenantSlug: string;
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface LoginResponse {
    user: Omit<User, 'passwordHash'>;
    tokens: AuthTokens;
}
export interface TenantContext {
    id: string;
    slug: string;
    schemaName: string;
    status: TenantStatus;
}
export interface DomainEvent<T = unknown> {
    id: string;
    type: string;
    tenantId: string;
    payload: T;
    occurredAt: Date;
    version: number;
}
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
//# sourceMappingURL=index.d.ts.map
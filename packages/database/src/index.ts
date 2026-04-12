// ================================================
// @retail-saas/database - Database Utilities & Types
// ================================================
// Re-export Prisma types và helpers dùng chung

// Prisma types sẽ được import từ apps/api khi cần
// Package này chứa database helpers dùng chung

/**
 * Xây dựng database URL từ các components
 */
export function buildDatabaseUrl(options: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  schema?: string;
}): string {
  const { host, port, user, password, database, schema } = options;
  const base = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  if (schema) {
    return `${base}?schema=${schema}`;
  }
  return base;
}

/**
 * Xây dựng schema name cho tenant
 */
export function buildTenantSchemaName(tenantSlug: string): string {
  return `tenant_${tenantSlug.replace(/-/g, '_')}`;
}

/**
 * SQL để tạo tenant schema
 */
export function buildCreateSchemaSQL(schemaName: string): string {
  return `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`;
}

/**
 * SQL để set search_path
 */
export function buildSetSearchPathSQL(schemaName: string): string {
  return `SET search_path = "${schemaName}"`;
}

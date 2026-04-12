-- ================================================
-- init-db.sql - PostgreSQL Initialization Script
-- Chạy lần đầu khi container khởi động
-- ================================================

-- Tạo extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tạo schema mặc định cho demo tenant
-- (sẽ được tạo tự động khi tenant được tạo)
-- CREATE SCHEMA IF NOT EXISTS tenant_demo;

-- Log
SELECT 'Database initialized successfully' AS status;

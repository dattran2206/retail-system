# 📋 Software Specification — Retail SaaS

> **Version:** 1.2.2 | **Cập nhật:** 2026-04-27 | **Phase hiện tại:** Phase 1 🚧

Tài liệu tổng hợp đặc tả kỹ thuật của hệ thống **Retail SaaS** — nền tảng quản lý bán lẻ đa tenant (multi-tenant), hỗ trợ nhiều loại hình kinh doanh (cà phê, quán ăn, tạp hóa, ...).

---

## 📌 Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Tech Stack](#2-tech-stack)
3. [Kiến trúc tổng thể](#3-kiến-trúc-tổng-thể)
4. [Cấu trúc Monorepo](#4-cấu-trúc-monorepo)
5. [Database Schema](#5-database-schema)
6. [API Specification](#6-api-specification)
7. [Modules & Services](#7-modules--services)
8. [Multi-Tenant Architecture](#8-multi-tenant-architecture)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Shared Packages](#10-shared-packages)
11. [Infrastructure & DevOps](#11-infrastructure--devops)
12. [**Nghiệp vụ hệ thống**](#12-nghiệp-vụ-hệ-thống)
    - 12.1 [Bán hàng & Thu ngân](#121-bán-hàng--thu-ngân)
    - 12.2 [Quản lý kho & Sản phẩm](#122-quản-lý-kho--sản-phẩm)
    - 12.3 [Khách hàng, Tích điểm & Khuyến mãi](#123-khách-hàng-tích-điểm--khuyến-mãi)
    - 12.4 [Nhân viên & Vận hành ca](#124-nhân-viên--vận-hành-ca)
    - 12.5 [Hệ thống báo cáo](#125-hệ-thống-báo-cáo)
    - 12.6 [Cấu hình theo loại hình kinh doanh](#126-cấu-hình-theo-loại-hình-kinh-doanh)
    - 12.7 [Danh sách tính năng theo mức độ ưu tiên](#127-danh-sách-tính-năng-theo-mức-độ-ưu-tiên)
13. [Roadmap](#13-roadmap)

---

## 1. Tổng quan hệ thống

### Mô tả

Hệ thống SaaS quản lý bán lẻ cho phép nhiều **tenant** (doanh nghiệp/cửa hàng) vận hành trên cùng một nền tảng dùng chung, mỗi tenant có dữ liệu **hoàn toàn độc lập** thông qua cơ chế **PostgreSQL Schema Per Tenant**.

### Đặc điểm nổi bật

| Đặc điểm | Chi tiết |
|---|---|
| Mô hình | Multi-tenant SaaS |
| Isolation | PostgreSQL schema per tenant |
| Loại hình hỗ trợ | Cà phê, quán ăn, tạp hóa |
| Offline support | IndexedDB (POS hoạt động không cần mạng ~2h) |
| Realtime | WebSocket (KDS bếp) |
| Mobile-first | Dashboard PWA cho chủ cửa hàng |

### Các ứng dụng trong hệ thống

| App | Mô tả | Port |
|---|---|---|
| `apps/api` | NestJS Backend API | `3000` |
| `apps/web-pos` | POS Frontend (Next.js 14 PWA) | `3001` |
| `apps/admin-dashboard` | Admin Dashboard (Next.js 14) | `3002` |
| `apps/web-mobile-owner` | Mobile Web cho chủ cửa hàng | `3003` |
| `apps/kickchen-display` | Màn hình KDS bếp | `3004` |

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Backend** | NestJS (TypeScript) + Clean Architecture | v10+ |
| **ORM** | Prisma | v5+ |
| **Database** | PostgreSQL | v15 |
| **Cache / Session** | Redis | v7 |
| **Frontend** | Next.js (App Router) + PWA | v14 |
| **State Management** | Zustand | latest |
| **Container** | Docker + Docker Compose | v2 |
| **Monorepo** | npm Workspaces + Turborepo | latest |
| **Validation** | class-validator + class-transformer | latest |
| **API Docs** | Swagger / OpenAPI | v3 |
| **Authentication** | JWT (Access + Refresh Token) | — |
| **Password** | bcrypt (salt rounds: 12) | — |
| **Testing** | Jest | latest |

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT LAYER                        │
│  web-pos │ admin-dashboard │ mobile-owner │ kitchen  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│                   API LAYER (NestJS)                 │
│  TenantMiddleware → Guards → Controllers → Services  │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────────┐
│   PostgreSQL 15  │   │         Redis 7               │
│  public schema   │   │  sessions / cache / queues    │
│  tenant_<slug>   │   └──────────────────────────────┘
└──────────────────┘
```

### Clean Architecture (per module)

```
Controller → Service → Repository → Prisma → Database
                ↑
           Domain Entities (packages/core)
```

---

## 4. Cấu trúc Monorepo

```
retail-system/
├── apps/
│   ├── api/                        # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema (public)
│   │   │   └── seeds/              # Plan + Demo tenant + Admin seed
│   │   └── src/
│   │       ├── common/             # Middlewares, guards, filters, decorators
│   │       ├── config/             # Environment config
│   │       ├── database/           # PrismaService
│   │       ├── infrastructure/     # Redis, external services
│   │       ├── modules/
│   │       │   ├── auth/           # JWT Authentication
│   │       │   ├── tenant/         # Tenant management + schema provisioning
│   │       │   ├── user/           # User CRUD + roles
│   │       │   ├── catalog/        # Products + Categories
│   │       │   ├── inventory/      # Stock management
│   │       │   ├── order/          # Orders + Transactions
│   │       │   ├── payment/        # Payment processing
│   │       │   ├── promotion/      # Promotions + Vouchers
│   │       │   ├── customer/       # CRM + Loyalty
│   │       │   ├── staff/          # Staff management
│   │       │   ├── shift/          # Ca làm việc
│   │       │   ├── analytics/      # Reports + Dashboard
│   │       │   └── notification/   # Notifications
│   │       └── main.ts
│   │
│   ├── web-pos/                    # POS Frontend (Next.js 14)
│   ├── admin-dashboard/            # Admin (Next.js 14)
│   ├── web-mobile-owner/           # Mobile Web
│   └── kickchen-display/           # Kitchen Display System
│
├── packages/                       # Shared Libraries
│   ├── core/                       # Base entities, use cases, domain errors
│   ├── constants/                  # Shared enums & constants
│   ├── database/                   # Shared DB helpers
│   ├── event-bus/                  # In-memory pub/sub
│   ├── handlers/                   # Error handlers
│   ├── logger/                     # Winston logger
│   ├── types/                      # Shared TypeScript interfaces
│   └── utils/                      # Helper functions (slugify, etc.)
│
├── infra/
│   ├── docker/                     # Dockerfiles
│   └── scripts/                    # DB init scripts
│
├── .env / .env.example
├── docker-compose.yml
├── package.json                    # npm workspaces root
├── turbo.json                      # Turborepo config
└── tsconfig.base.json
```

---

## 5. Database Schema

### Mô hình dữ liệu

Hệ thống sử dụng **hai lớp schema** trong PostgreSQL:

- **`public` schema**: Chứa dữ liệu nền tảng (tenants, plans, users hệ thống)
- **`tenant_<slug>` schema**: Dữ liệu riêng của từng tenant (products, orders, customers...)

### Public Schema — Models hiện tại

#### Model `Plan` — Gói dịch vụ

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `id` | `String` (UUID) | PK | ID gói |
| `name` | `String` | UNIQUE | Tên code (`FREE`, `PRO`, `ENTERPRISE`) |
| `displayName` | `String` | — | Tên hiển thị |
| `price` | `Decimal(10,2)` | DEFAULT 0 | Giá gói |
| `features` | `Json` | — | Danh sách tính năng |
| `isActive` | `Boolean` | DEFAULT true | Trạng thái kích hoạt |
| `createdAt` | `DateTime` | AUTO | Ngày tạo |
| `updatedAt` | `DateTime` | AUTO | Ngày cập nhật |

**Seed mặc định**: `FREE`, `PRO`, `ENTERPRISE`

#### Model `Tenant` — Cửa hàng / Doanh nghiệp

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `id` | `String` (UUID) | PK | ID tenant |
| `slug` | `String` | UNIQUE, INDEX | Định danh URL-friendly |
| `name` | `String` | — | Tên cửa hàng |
| `schemaName` | `String` | UNIQUE | Tên PostgreSQL schema (`tenant_<slug>`) |
| `status` | `TenantStatus` | DEFAULT PENDING | Trạng thái |
| `planId` | `String` | FK → Plan | Gói đăng ký |
| `email` | `String?` | — | Email liên hệ |
| `phone` | `String?` | — | Số điện thoại |
| `address` | `String?` | — | Địa chỉ |
| `settings` | `Json?` | DEFAULT `{}` | Cài đặt cửa hàng |
| `createdAt` | `DateTime` | AUTO | |
| `updatedAt` | `DateTime` | AUTO | |

**Indexes**: `slug`, `status`

#### Model `User` — Người dùng hệ thống

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `id` | `String` (UUID) | PK | ID user |
| `email` | `String` | UNIQUE, INDEX | Email đăng nhập |
| `passwordHash` | `String` | — | Mật khẩu đã hash (bcrypt) |
| `name` | `String` | — | Tên hiển thị |
| `role` | `UserRole` | DEFAULT CASHIER | Phân quyền |
| `isActive` | `Boolean` | DEFAULT true | Trạng thái kích hoạt |
| `tenantId` | `String` | FK → Tenant | Tenant sở hữu |
| `lastLoginAt` | `DateTime?` | — | Lần đăng nhập cuối |
| `refreshToken` | `String?` | — | Refresh token hiện tại |
| `createdAt` | `DateTime` | AUTO | |
| `updatedAt` | `DateTime` | AUTO | |

**Indexes**: `email`, `tenantId`

### Enums

#### `TenantStatus`

| Value | Mô tả |
|---|---|
| `ACTIVE` | Đang hoạt động |
| `PENDING` | Chờ kích hoạt |
| `SUSPENDED` | Tạm ngưng |
| `DELETED` | Đã xóa |

#### `UserRole`

| Value | Quyền hạn |
|---|---|
| `SUPER_ADMIN` | Quản trị toàn hệ thống |
| `TENANT_ADMIN` | Quản trị tenant |
| `MANAGER` | Quản lý cửa hàng |
| `CASHIER` | Thu ngân (mặc định) |
| `VIEWER` | Chỉ xem báo cáo |

---

## 6. API Specification

### Base URL

```
http://localhost:3000/api/v1
```

### Headers bắt buộc

| Header | Mô tả | Ví dụ |
|---|---|---|
| `X-Tenant-ID` | Slug của tenant | `demo` |
| `Authorization` | JWT Bearer token (các endpoint được bảo vệ) | `Bearer <token>` |
| `Content-Type` | | `application/json` |

### Swagger UI

```
http://localhost:3000/docs   (chỉ ở development mode)
```

---

### 6.1 Auth Endpoints

#### `POST /auth/register` — Đăng ký tài khoản

**Request Body:**

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@demo.com",
  "password": "Password@123"
}
```

| Field | Type | Rule |
|---|---|---|
| `name` | `string` | 2–100 ký tự |
| `email` | `string` | Email hợp lệ |
| `password` | `string` | Min 8 ký tự, ≥1 chữ hoa, ≥1 chữ thường, ≥1 số |

**Response `201`:**

```json
{
  "id": "uuid",
  "email": "user@demo.com",
  "name": "Nguyễn Văn A",
  "role": "CASHIER",
  "isActive": true,
  "tenantId": "uuid",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Error codes:**
- `EMAIL_ALREADY_EXISTS` (409) — Email đã được đăng ký trong tenant

---

#### `POST /auth/login` — Đăng nhập

**Request Body:**

```json
{
  "email": "admin@demo.com",
  "password": "Demo@123456"
}
```

**Response `200`:**

```json
{
  "user": { "id": "...", "email": "...", "role": "CASHIER", ... },
  "tokens": {
    "accessToken": "<JWT>",
    "refreshToken": "<JWT>",
    "expiresIn": 604800
  }
}
```

**JWT Expiry**: Access token = **7 ngày**, Refresh token = **30 ngày**

**Error codes:**
- `INVALID_CREDENTIALS` (401) — Sai email hoặc mật khẩu
- `ACCOUNT_DISABLED` (401) — Tài khoản đã bị vô hiệu hóa

---

#### `GET /auth/me` — Thông tin user hiện tại

> 🔒 Yêu cầu `Authorization: Bearer <token>`

**Response `200`:** User object (không có `passwordHash`)

**Error codes:**
- `USER_NOT_FOUND` (401)

---

### 6.2 Tenant Endpoints

> 🔒 Chỉ dành cho `SUPER_ADMIN`

#### `GET /tenants` — Danh sách tenants

**Query params:**

| Param | Type | Default | Mô tả |
|---|---|---|---|
| `page` | `number` | `1` | Trang hiện tại |
| `limit` | `number` | `20` | Số item/trang |

**Response `200`:**

```json
{
  "data": [ { "id": "...", "slug": "demo", "name": "...", "status": "ACTIVE", "plan": {...} } ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

#### `GET /tenants/:id` — Chi tiết tenant

**Response `200`:** Tenant object kèm `plan`

**Error codes:**
- `TENANT_NOT_FOUND` (404)

---

#### `POST /tenants` — Tạo tenant mới

**Request Body:**

```json
{
  "name": "Cửa hàng tiện lợi A",
  "slug": "cua-hang-tien-loi-a",
  "email": "contact@storea.com",
  "phone": "0901234567",
  "address": "TP.HCM",
  "planId": "PLAN-PRO"
}
```

| Field | Bắt buộc | Rule |
|---|---|---|
| `name` | ✅ | 2–100 ký tự |
| `slug` | ❌ | Tự sinh từ `name` nếu không truyền. Chỉ chứa `[a-z0-9-]` |
| `email` | ❌ | Email hợp lệ |
| `phone` | ❌ | String |
| `address` | ❌ | String |
| `planId` | ❌ | Mặc định = `FREE` plan |

**Error codes:**
- `INVALID_SLUG` (400)
- `TENANT_SLUG_TAKEN` (409)

---

### 6.3 Pagination Response Format

Tất cả endpoints trả danh sách đều dùng format sau:

```typescript
{
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}
```

---

## 7. Modules & Services

### Module hiện có

| Module | Trạng thái | Mô tả |
|---|---|---|
| `auth` | ✅ Có | JWT login/register/me |
| `tenant` | ✅ Có | CRUD tenants + schema provisioning |
| `user` | ✅ Có | CRUD users trong tenant |
| `catalog` | 🔲 Planned | Products, Categories, Variants |
| `inventory` | 🔲 Planned | Stock management, alerts |
| `order` | 🔲 Planned | POS orders, transactions |
| `payment` | 🔲 Planned | Cash, transfer, split payment |
| `promotion` | 🔲 Planned | Vouchers, promotion engine |
| `customer` | 🔲 Planned | CRM, loyalty points |
| `staff` | 🔲 Planned | Nhân sự, phân quyền |
| `shift` | 🔲 Planned | Ca làm việc, đối soát ca |
| `analytics` | 🔲 Planned | Dashboard, báo cáo |
| `notification` | 🔲 Planned | Push notifications |

### UserService — Methods hiện có

| Method | Signature | Mô tả |
|---|---|---|
| `findById` | `(id, tenantId)` | Tìm user theo ID trong tenant |
| `findByEmail` | `(email, tenantId)` | Tìm user theo email trong tenant |
| `create` | `(data)` | Tạo user mới |
| `updateLastLogin` | `(userId)` | Cập nhật `lastLoginAt` |
| `findAllByTenant` | `(tenantId, page, limit)` | Danh sách users có phân trang |
| `deactivate` | `(userId)` | Vô hiệu hóa user |

### TenantService — Methods hiện có

| Method | Signature | Mô tả |
|---|---|---|
| `findBySlug` | `(slug)` | Tìm tenant theo slug |
| `findById` | `(id)` | Tìm tenant theo ID |
| `findAll` | `(page, limit)` | Danh sách tenants có phân trang |
| `create` | `(dto)` | Tạo tenant + PostgreSQL schema |
| `createTenantSchema` | `(schemaName)` | Tạo PostgreSQL schema riêng |
| `updateStatus` | `(id, status)` | Cập nhật trạng thái tenant |

---

## 8. Multi-Tenant Architecture

### Schema Isolation — PostgreSQL Schema Per Tenant

```
public.plans        → Gói SaaS (FREE/PRO/ENTERPRISE)
public.tenants      → Danh sách cửa hàng
public.users        → Users hệ thống
tenant_demo.*       → Toàn bộ dữ liệu của tenant "demo"
tenant_storea.*     → Toàn bộ dữ liệu của tenant "storea"
```

### Request Flow

```
Client Request
    │
    ├─ Header: X-Tenant-ID: demo
    │
    ▼
TenantMiddleware
    ├─ Lookup tenant trong public.tenants WHERE slug = 'demo'
    ├─ Kiểm tra status = ACTIVE
    ├─ Gán req.tenant = { id, slug, schemaName, ... }
    └─ SET search_path = "tenant_demo"
    │
    ▼
Route Handler → Mọi Prisma query tự động chạy trong schema tenant_demo
```

### Tenant Schema Provisioning

Khi tạo tenant mới:
1. Tạo record trong `public.tenants`
2. Tự động tạo PostgreSQL schema: `CREATE SCHEMA "tenant_<slug>"`
3. Schema `tenant_<slug>` chứa toàn bộ tables nghiệp vụ (products, orders, customers...)

### Schema Naming Convention

| Tenant Slug | Schema Name |
|---|---|
| `demo` | `tenant_demo` |
| `cua-hang-a` | `tenant_cua_hang_a` |
| `coffee-shop-01` | `tenant_coffee_shop_01` |

---

## 9. Authentication & Authorization

### JWT Flow

```
Login → accessToken (7d) + refreshToken (30d)
           │
     Bearer <accessToken>
           │
     JwtAuthGuard → Validate → req.user = { sub, email, role, tenantId }
```

### JWT Payload (`JwtPayload`)

```typescript
{
  sub: string;         // User ID
  email: string;
  role: UserRole;      // SUPER_ADMIN | TENANT_ADMIN | MANAGER | CASHIER | VIEWER
  tenantId: string;
  tenantSlug: string;
}
```

### Role-based Access

| Role | Quyền |
|---|---|
| `SUPER_ADMIN` | Toàn quyền hệ thống, quản lý tenants |
| `TENANT_ADMIN` | Toàn quyền trong tenant của mình |
| `MANAGER` | Quản lý cửa hàng, xem báo cáo |
| `CASHIER` | Thao tác POS, tạo đơn, thanh toán |
| `VIEWER` | Chỉ xem báo cáo, không thao tác |

### Password Policy

- Tối thiểu **8 ký tự**, tối đa **72 ký tự**
- Phải chứa ≥1 chữ hoa, ≥1 chữ thường, ≥1 chữ số
- Hash bằng **bcrypt** với salt rounds = **12**
- Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

---

## 10. Shared Packages

### `@retail-saas/core`

Base classes và abstractions cho toàn bộ hệ thống:

| Export | Mô tả |
|---|---|
| `BaseEntity` | Abstract class — `id`, `createdAt`, `updatedAt` |
| `IRepository<T>` | Interface repository: findById, findAll, create, update, delete |
| `BaseService<T>` | Abstract service với findById/findAll |
| `UseCase<TInput, TOutput>` | Interface use case pattern |
| `Email` | Value Object cho email (validation + normalisation) |
| `DomainError` | Base domain error |
| `NotFoundError` | 404 domain error |
| `ConflictError` | 409 domain error |
| `UnauthorizedError` | 401 domain error |
| `ForbiddenError` | 403 domain error |
| `ValidationError` | 422 domain error |

### `@retail-saas/types`

Shared TypeScript interfaces:

| Type | Mô tả |
|---|---|
| `JwtPayload` | JWT token payload |
| `AuthTokens` | `{ accessToken, refreshToken, expiresIn }` |
| `PaginationMeta` | Metadata phân trang |
| `PaginationParams` | `{ page, limit }` |
| `DeepPartial<T>` | Utility type |
| `TenantStatus` | Enum trạng thái tenant |

### `@retail-saas/utils`

Helper functions:

| Function | Mô tả |
|---|---|
| `slugify(str)` | Chuyển chuỗi thành slug URL-friendly |
| `toSchemaName(slug)` | Chuyển slug thành tên schema PostgreSQL |
| `isValidSlug(slug)` | Validate slug format |

---

## 11. Infrastructure & DevOps

### Môi trường Development

| Service | Container | Port (host) | Port (internal) |
|---|---|---|---|
| PostgreSQL 15 | `retail_saas_postgres` | `55432` | `5432` |
| Redis 7 | `retail_saas_redis` | `6379` | `6379` |
| NestJS API | `retail_saas_api` | `3000` | `3000` |

### Environment Variables

| Variable | Default | Mô tả |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `DB_USER` | `postgres` | DB username |
| `DB_PASSWORD` | `postgres` | DB password |
| `DB_NAME` | `retail_saas_platform` | DB name |
| `DB_PORT` | `55432` | Exposed port |
| `REDIS_HOST` | `redis` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | dev-secret | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | Access token TTL |
| `JWT_REFRESH_SECRET` | dev-refresh-secret | Refresh token secret |
| `CORS_ORIGINS` | `http://localhost:3001` | Allowed origins |
| `LOG_LEVEL` | `debug` | Winston log level |
| `API_PORT` | `3000` | API server port |

### Lệnh thường dùng

```bash
# Khởi động infra
docker-compose up postgres redis -d

# Cài dependencies
npm install

# Database migration
npm run db:migrate

# Seed dữ liệu
npm run db:seed

# Chạy development
npm run dev

# Chạy riêng API
npm run dev --workspace=apps/api

# Chạy với Docker
docker-compose up --build
```

### Dữ liệu seed mặc định

| Loại | Giá trị |
|---|---|
| Plans | `FREE`, `PRO`, `ENTERPRISE` |
| Demo tenant slug | `demo` |
| Demo tenant schema | `tenant_demo` |
| Admin email | `admin@demo.com` |
| Admin password | `Demo@123456` |

---

## 12. Nghiệp vụ hệ thống

> Phần này được tổng hợp và phân tích từ tài liệu thiết kế `retail_system_design.docx` — mô tả chi tiết các luồng nghiệp vụ, quy tắc xử lý và yêu cầu hành vi của từng module.

---

### 12.1 Bán hàng & Thu ngân

#### Phạm vi loại hình kinh doanh hỗ trợ

| Loại hình | Đặc thù chính | Module ưu tiên |
|---|---|---|
| Quán cà phê | Biến thể (size/topping), recipe nguyên liệu | POS, KDS, Recipe BOM |
| Quán ăn / nhà hàng | Đặt bàn, màn bếp, gọi món theo bàn | Table Order, KDS, BOM |
| Tạp hoá / minimart | Nhiều SKU, barcode, hạn dùng | Kho, mã vạch, lô hàng |
| Cửa hàng thời trang | Biến thể size × màu, đổi trả | Variant matrix, kho |
| Tiệm bánh | Nguyên liệu tươi, đặt trước, HSD ngắn | Recipe, đặt hàng, HSD |

#### Luồng bán hàng chính — 6 bước

| Bước | Mô tả & Lưu ý thiết kế |
|---|---|
| 1. Chọn sản phẩm | Tìm kiếm, scan barcode, chọn menu. Hỗ trợ biến thể (size, topping, ghi chú). |
| 2. Cấu hình biến thể | Size, topping, đường, đá, số lượng, ghi chú đặc biệt cho từng item. |
| 3. Xem & chỉnh giỏ hàng | Thêm/bớt món, ghi chú đơn hàng, xem tổng tiền realtime. |
| 4. Áp dụng khuyến mãi | Tự động detect KM đang active, cho phép nhập voucher code thủ công. |
| 5. Chọn hình thức thanh toán | Tiền mặt (tính tiền thừa), QR (polling webhook), thẻ, ví điện tử. |
| 6. Hoàn tất & in bill | Cập nhật kho, ghi doanh thu, in hoá đơn nhiệt, thông báo bếp. |

#### Các nhánh nghiệp vụ đặc biệt

**Thanh toán tiền mặt**
- Thu ngân nhập số tiền khách đưa → hệ thống tính tiền thừa tự động → mở ngăn kéo tiền → xác nhận.
- Hỗ trợ ghi nợ cho khách quen (với quyền phù hợp).

**Thanh toán QR & Chuyển khoản (Stripe, MoMo, ZaloPay)**
- Tạo mã QR động → hiển thị cho khách quét → polling kết quả qua webhook → xác nhận / timeout.
- Xử lý trường hợp webhook đến trễ bằng cơ chế đối soát cuối ngày.
- Idempotency key bắt buộc cho mỗi payment request.

**Thanh toán chia nhóm / tách bill**
- Hỗ trợ split payment: một đơn có thể thanh toán bằng nhiều phương thức khác nhau.
- Ví dụ: khách thanh toán 100k tiền mặt + 50k QR.

**Offline mode** (⚠️ Tạm hoãn - Chuyển sang Phase sau)
- Khi mất kết nối: chuyển sang offline mode, lưu đơn hàng local (IndexedDB / SQLite).
- Chỉ nhận tiền mặt khi offline.
- Đồng bộ toàn bộ khi có mạng lại (sync queue với retry logic).
- **Bắt buộc** cho thị trường Việt Nam (tương lai) — POS phải hoạt động ≥ 2 giờ không mạng.

**Hoàn trả / Huỷ đơn**
- Yêu cầu quyền Manager hoặc Supervisor.
- Ghi lý do huỷ bắt buộc.
- Hoàn tiền đúng hình thức đã thanh toán (cash hoàn cash, QR hoàn QR).
- Nhập lại kho tự động khi huỷ.
- Ghi log đầy đủ với timestamp và user thực hiện.
- Hoàn điểm tích lũy khi huỷ đơn.

#### Phân loại Đơn hàng & Quản lý bàn

Hệ thống hỗ trợ 3 loại hình đơn hàng chính để phục vụ đa dạng mô hình kinh doanh (Cà phê, Nhà hàng, Take-away):

| Loại đơn | Đặc điểm | Nghiệp vụ đi kèm |
|---|---|---|
| **DINE_IN (Ngồi tại chỗ)** | Khách ngồi tại quán | Bắt buộc chọn Bàn. Theo dõi trạng thái bàn (Trống/Đang dùng). Hỗ trợ chuyển/gộp bàn. |
| **TAKE_AWAY (Mang đi)** | Khách mua mang về | Không cần chọn bàn. Ghi nhận tên khách/số thứ tự để gọi món khi xong. |
| **DELIVERY (Giao hàng)** | Đơn qua App/Shipper | Ghi nhận đối tác giao hàng (Grab, ShopeeFood, BeFood, ...) hoặc Shipper riêng. |

**Quản lý khu vực & bàn (Table Management):**
- **Phân khu vực (Area):** Tầng 1, Tầng 2, Sân thượng, Phòng VIP, v.v.
- **Trạng thái bàn (Table Status):** 
    - `AVAILABLE` (Trống): Bàn sẵn sàng đón khách.
    - `OCCUPIED` (Đang dùng): Có khách ngồi và có đơn hàng chưa thanh toán.
    - `RESERVED` (Đặt trước): Bàn đã có khách đặt lịch.
- **Liên kết đơn hàng:** Một bàn chỉ có 1 đơn hàng active tại một thời điểm. Hỗ trợ in báo bếp theo số bàn.

#### Mở ca & Đóng ca

> Đây là nghiệp vụ thường bị bỏ sót nhưng **quan trọng nhất** để kiểm soát thất thoát tiền mặt.

**Công thức đối soát tiền mặt cuối ca:**

```
Tiền mặt đầu ca (nhập khi mở ca)              +X
Doanh thu tiền mặt trong ca                   +Y
Chi tiền mặt (mua hàng, hoàn trả tiền mặt)   -Z
──────────────────────────────────────────────────
Tiền mặt phải có (theo hệ thống)   = X + Y - Z
Tiền mặt thực tế thu ngân đếm được = W
──────────────────────────────────────────────────
Chênh lệch = W - (X+Y-Z)  →  Báo cáo cho chủ cửa hàng
```

**Luồng ca làm việc:**

| Bước | Mô tả |
|---|---|
| Mở ca — nhập tiền đầu ca | Quản lý đếm và nhập số tiền mặt thực tế trong ngăn kéo. Đây là baseline để đối soát cuối ca. |
| Phân công nhân viên | Ghi nhận ai làm vị trí nào trong ca (quầy, bếp, kho). Mỗi nhân viên có session riêng. |
| Bán hàng trong ca | Thu ngân đăng nhập tài khoản cá nhân = xác nhận bắt đầu. Doanh thu ghi theo từng người. |
| Chuyển ca giữa chừng | Đếm tiền bàn giao, cả hai ký xác nhận digital, nhân viên mới đăng nhập tiếp tục. |
| Đóng ca — đối soát tiền | Thu ngân đếm thực tế, so với hệ thống, ghi chênh lệch và lý do. |
| Chốt & in báo cáo ca | Lưu hệ thống, gửi báo cáo ca cho chủ qua Zalo / email. |

---

### 12.2 Quản lý kho & Sản phẩm

#### Catalog sản phẩm linh hoạt

Catalog đủ generic để xử lý mọi loại hình mà không cần thay đổi schema:

| Loại hình | Biến thể sản phẩm | Đơn vị tính đặc thù |
|---|---|---|
| Quán cà phê | Size (S/M/L) × Topping × Đường × Đá | Ly, gram cà phê, ml sữa |
| Quán ăn | Không biến thể / set menu | Phần, suất, kg nguyên liệu |
| Tạp hoá | Không biến thể | Cái, hộp, thùng, kg — quy đổi lẫn nhau |
| Thời trang | Size × Màu sắc (matrix) | Cái — mỗi combo là 1 SKU riêng |

**Cấu trúc sản phẩm:**
- `products`: Sản phẩm gốc (tên, danh mục, đơn vị, ảnh)
- `product_variants`: Biến thể (mỗi sản phẩm có ít nhất 1 variant mặc định, mỗi variant có giá bán + giá vốn)
- `unit_conversions`: Quy đổi đơn vị (nhập theo thùng, bán theo lon)

#### Theo dõi tồn kho — Nguyên tắc cốt lõi

> Tồn kho là **bảng transaction**, không phải một con số. Mọi thay đổi đi qua bảng `stock_movement`.

**Công thức tồn kho:**
```
Tồn kho = Tồn đầu kỳ + Tổng nhập − Tổng xuất (bán + huỷ + điều chỉnh)
```

**Các loại stock movement:**

| `movement_type` | Mô tả |
|---|---|
| `sale` | Bán hàng (trừ kho) |
| `sale_return` | Hoàn trả (cộng kho) |
| `purchase` | Nhập hàng (cộng kho) |
| `adjustment` | Kiểm kê điều chỉnh |
| `waste` | Hao hụt / hỏng |
| `transfer_in` | Nhận chuyển kho từ chi nhánh khác |
| `transfer_out` | Chuyển kho sang chi nhánh khác |

- `stock_levels`: Cache tồn kho hiện tại theo chi nhánh.
- `reserved_qty`: Số lượng đặt trước (đơn đang xử lý) chưa được xuất kho chính thức.
- `min_quantity`: Ngưỡng cảnh báo hết hàng. Khi tồn kho ≤ `min_quantity`, gửi cảnh báo.

#### Recipe / BOM — Công thức nguyên liệu

Áp dụng cho quán ăn, quán cà phê, tiệm bánh. Khi bán 1 đơn vị sản phẩm, hệ thống tự động trừ từng nguyên liệu theo định mức.

**Ví dụ — Recipe của Latte M:**

| Nguyên liệu | Định mức | Hành động |
|---|---|---|
| Espresso | 18 gram | Trừ kho nguyên liệu "Espresso" 18g |
| Sữa tươi | 180 ml | Trừ kho nguyên liệu "Sữa tươi" 180ml |
| Đường | 10 gram | Trừ kho nguyên liệu "Đường" 10g |

**Logic cảnh báo:** Nếu sữa tươi còn 500ml → tối đa bán được thêm 2 ly Latte M → cảnh báo sắp hết.

**Lưu ý khi thay đổi recipe:** Hỏi người dùng có áp dụng cho tồn kho cũ không. Lưu lịch sử thay đổi.

#### Luồng nhập hàng

| Bước | Chi tiết |
|---|---|
| Tạo phiếu đặt hàng (PO) | Chọn NCC, sản phẩm, số lượng, giá dự kiến. Có thể tạo thủ công hoặc tự động khi tồn kho xuống dưới ngưỡng min. |
| Gửi & xác nhận với NCC | Gửi email tự động, theo dõi trạng thái PO (`draft` → `ordered` → `partial` → `received` → `cancelled`). |
| Nhận hàng & kiểm đếm | Scan barcode từng mặt hàng, nhập số lượng thực nhận, ghi lô hàng và hạn dùng. |
| Đối chiếu với PO | So sánh SL thực nhận vs SL đặt. Ghi nhận chênh lệch, liên hệ NCC nếu thiếu/sai. |
| Tạo phiếu nhập kho | Ghi giá nhập thực tế, cập nhật giá vốn trung bình (weighted average cost). |
| Cập nhật tồn kho | Cộng SL vào stock, ghi `stock_movement` với `type = 'purchase'`. |

#### Kiểm kê kho

- Tạo phiên kiểm kê (`adjustment_session`), ghi số lượng thực tế đếm được cho từng sản phẩm.
- Hệ thống so sánh với tồn kho lý thuyết → tính chênh lệch.
- Xác nhận → tạo `stock_movement` với `type = 'adjustment'` để điều chỉnh.
- Lưu lịch sử đầy đủ — không xóa, không sửa.

---

### 12.3 Khách hàng, Tích điểm & Khuyến mãi

#### Hồ sơ khách hàng

Nhận diện khách hàng bằng **số điện thoại** — không cần thẻ vật lý, không cần app, không làm chậm hàng dài. Phù hợp với thực tế vận hành tại Việt Nam.

| Thông tin | Ghi chú |
|---|---|
| Tên, số điện thoại (bắt buộc) | SĐT là primary key để nhận diện tại quầy |
| Ngày sinh | Kích hoạt khuyến mãi sinh nhật tự động |
| Tổng chi tiêu tích lũy | Dùng để xét hạng thành viên |
| Hạng thành viên hiện tại | Đồng / Bạc / Vàng / VIP... |
| Số dư điểm & lịch sử điểm | Bảng `point_transaction` — không phải con số đơn giản |
| Lịch sử giao dịch | Link sang bảng `orders` — không lưu redundant |
| Tags nội bộ | `["vip_handpick", "birthday_campaign", "inactive_90d"]` — nhân viên ghi, khách không thấy |

**Bảo mật:** Mã hoá SĐT trong DB. Thu ngân chỉ thấy tên, không thấy SĐT đầy đủ.

#### Hệ thống tích điểm

> Điểm phải là **bảng transaction** (`point_transaction`), không phải một trường số trong bảng customer. Bắt buộc để xử lý điểm hết hạn và hoàn điểm khi huỷ đơn.

- Tích điểm theo giá trị đơn hàng (sau giảm giá): ví dụ 1 điểm / 10,000 VNĐ.
- Điểm thưởng đặc biệt: sinh nhật, sự kiện x2 điểm, giới thiệu bạn.
- Điểm hết hạn sau N ngày — thúc đẩy khách quay lại.
- Đổi điểm: lấy giảm giá, đổi quà, hoặc cả hai.
- Hoàn điểm tự động khi huỷ/hoàn trả đơn hàng.

**Các loại transaction điểm:**

| `transaction_type` | Mô tả |
|---|---|
| `earn` | Cộng điểm từ đơn hàng |
| `redeem` | Dùng điểm để thanh toán |
| `expire` | Điểm hết hạn (batch job hàng đêm) |
| `adjust` | Admin điều chỉnh thủ công |
| `bonus` | Điểm thưởng (sinh nhật, event) |
| `refund` | Hoàn điểm khi huỷ đơn |

#### Phân hạng thành viên

Hạng được tính tự động dựa trên `total_spent` sau mỗi đơn hàng hoàn thành:

| Hạng | Điều kiện (ví dụ) | Quyền lợi tiêu biểu |
|---|---|---|
| Đồng (mặc định) | Đăng ký tài khoản | Tích điểm cơ bản 1x |
| Bạc | Chi tiêu ≥ 2 triệu / 6 tháng | Tích điểm 1.2x, ưu tiên đặt bàn |
| Vàng | Chi tiêu ≥ 10 triệu / 6 tháng | Tích điểm 1.5x, giảm giá sinh nhật 20% |
| VIP (thủ công) | Manager chỉ định | Toàn bộ quyền lợi cao nhất, tích điểm 2x |

Cấu hình hạng thành viên lưu trong bảng `tier_configs` dạng dữ liệu, không hardcode.

#### Engine khuyến mãi

> Mỗi khuyến mãi = **1 action + n conditions** — thiết kế dưới dạng JSON rule engine, không hardcode từng loại vào code. Chủ cửa hàng tạo KM mới bằng cách tạo dữ liệu, không cần deploy.

**6 loại khuyến mãi cần hỗ trợ:**

| # | Loại | Mô tả |
|---|---|---|
| 1 | Giảm % hoặc tiền cố định | Trên tổng đơn hoặc từng sản phẩm |
| 2 | Ngưỡng đơn hàng | Đơn từ X → giảm Y (vd: từ 200k giảm 30k) |
| 3 | Mua kèm ưu đãi | Mua SP A → SP B giá đặc biệt |
| 4 | Buy X Get Y | Mua 2 tặng 1, mua 3 lấy giá thấp nhất miễn phí |
| 5 | Combo cố định | Chọn 3 món trong danh sách giá combo 99k |
| 6 | Mã voucher | Nhập code hoặc scan để nhận ưu đãi |

**Quy tắc ưu tiên khi nhiều KM cùng thoả điều kiện:**

- **Exclusive** (mặc định): chỉ áp 1 KM, chọn KM có số ưu tiên (`priority`) cao nhất.
- **Stackable** (cần bật có chủ ý): cộng dồn nhiều KM, cần giới hạn tổng giảm tối đa.

**Ví dụ conditions JSON:**
```json
{
  "min_order_amount": 200000,
  "applicable_days": ["monday", "tuesday"],
  "applicable_hours": { "from": "14:00", "to": "17:00" },
  "applicable_categories": ["uuid-ca-phe"],
  "customer_tiers": ["gold", "vip"],
  "max_uses_per_customer": 1
}
```

---

### 12.4 Nhân viên & Vận hành ca

#### Phân quyền theo vai trò (RBAC)

> Nguyên tắc **least privilege**: mỗi vai trò chỉ thấy đúng những gì cần thiết. Thu ngân không cần thấy tổng doanh thu tháng. Bếp không cần thấy thông tin khách hàng.

| Vai trò | Phạm vi truy cập | Quyền đặc biệt |
|---|---|---|
| Chủ cửa hàng | Toàn bộ hệ thống, mọi báo cáo, cấu hình | Xoá dữ liệu, cấu hình hệ thống |
| Quản lý ca | POS + báo cáo ca + quản lý NV trong ca | Duyệt hoàn trả, mở/đóng ca |
| Thu ngân | POS, menu, giá, áp KM, in bill | Không thấy doanh thu tổng |
| Thủ kho | Nhập/xuất kho, kiểm kê, xem tồn kho | Không thấy doanh thu, KH |
| Bếp / pha chế | Màn KDS, cập nhật trạng thái món | Không thao tác tiền |

#### Tính giờ làm & Lương

- **Check-in = đăng nhập vào POS** với tài khoản cá nhân — không cần máy chấm công riêng.
- Ghi nhận giờ làm thực tế, đánh dấu đi muộn / về sớm tự động.
- Tính lương theo: **Giờ làm + Hoa hồng % doanh thu cá nhân + Thưởng KPI**.
- Xuất bảng công và bảng lương Excel cuối tháng.

#### Màn hình KDS (Kitchen Display System)

- KDS **không cần người dùng đăng nhập** — chạy ở chế độ "display only", kết nối vào một `branch_id` cố định.
- Tự động hiển thị tất cả order đang active theo thứ tự thời gian.
- Màu sắc cảnh báo theo thời gian chờ:
  - 🟢 Xanh lá: < 5 phút
  - 🟡 Vàng: 5–10 phút
  - 🔴 Đỏ: > 10 phút
- Realtime qua WebSocket (Socket.io).

---

### 12.5 Hệ thống báo cáo

#### Phân tầng tần suất báo cáo

| Tần suất | Báo cáo | Đối tượng xem |
|---|---|---|
| Realtime (mỗi ca) | Dashboard 6 KPI: doanh thu hôm nay, số đơn, giá trị TB/đơn, lãi gộp, % QR, hoàn trả | Chủ — trên điện thoại |
| Hàng ngày | Tồn kho cảnh báo, báo cáo đối soát ca, doanh thu theo khung giờ | Chủ + Quản lý |
| Hàng tuần | Lãi gộp theo danh mục, sản phẩm bán chạy/chậm, hiệu suất NV | Chủ |
| Hàng tháng | Phân tích khách hàng RFM, bảng công NV, bảng lương, so sánh tháng trước | Chủ |

#### Báo cáo lãi gộp — Quan trọng nhất

> Nhiều cửa hàng biết doanh thu cao nhưng không biết thực lời hay lỗ vì chưa tính giá vốn đúng. Báo cáo này phụ thuộc hoàn toàn vào dữ liệu giá nhập và recipe BOM chính xác.

```
Doanh thu thuần   = Doanh thu gộp − Giảm giá − Hoàn trả
COGS              = SL bán × Giá vốn trung bình
                  (Với quán ăn/cà phê: COGS tính từ recipe BOM)
Lãi gộp           = Doanh thu thuần − COGS
Biên lãi gộp (%)  = Lãi gộp / Doanh thu thuần × 100
```

#### Ma trận phân tích sản phẩm (BCG-style)

| Nhóm | Đặc điểm | Chiến lược |
|---|---|---|
| ⭐ Stars (Bán nhiều + Lãi cao) | Sản phẩm tốt nhất | Đẩy mạnh hơn nữa, đảm bảo luôn có hàng, đào tạo NV upsell |
| 🐄 Cash Cow (Bán nhiều + Lãi thấp) | Kéo doanh thu nhưng ăn mòn biên lợi nhuận | Tối ưu COGS, xem xét tăng giá nhẹ |
| ❓ Question Mark (Bán ít + Lãi cao) | Tiềm năng chưa khai thác | Đẩy lên đầu menu, training NV giới thiệu, chạy KM |
| 🐕 Dogs (Bán ít + Lãi thấp) | Tiêu tốn tồn kho và shelf space | Xem xét cắt bỏ hoặc làm KM giải phóng tồn kho |

#### Nguyên tắc thiết kế báo cáo

- Mỗi báo cáo gắn với **hành động** — không chỉ hiển thị số, phải có nút "Tạo đơn nhập hàng", "Ẩn khỏi menu"...
- Dashboard xem được trên **điện thoại** — chủ cửa hàng cần xem mọi lúc mọi nơi.
- Cache kết quả tính toán nặng — lưu vào `reports_cache`, làm mới theo lịch (cron job).

---

### 12.6 Cấu hình theo loại hình kinh doanh

Bảng `store_config` lưu JSON cấu hình, quyết định tính năng nào bật/tắt cho từng cửa hàng:

| Config key | Quán cà phê | Quán ăn | Tạp hoá |
|---|---|---|---|
| `store_type` | `"cafe"` | `"restaurant"` | `"grocery"` |
| `order_mode` | `"table_based"` | `"table_based"` | `"counter"` |
| `product_variants` | `true` | `true` | `false` |
| `use_recipe_bom` | `true` | `true` | `false` |
| `kds_enabled` | `true` | `true` | `false` |
| `barcode_scan` | `false` | `false` | `true` |
| `batch_tracking` | `false` | `false` | `true` |

**Nguyên tắc:** Cấu hình dưới dạng dữ liệu — mỗi loại hình cửa hàng bật/tắt module qua config, **không cần deploy code mới**.

---

### 12.7 Danh sách tính năng theo mức độ ưu tiên

#### 🔴 Cốt lõi — Bắt buộc có trước khi ra mắt

| Tính năng | Module |
|---|---|
| Tạo & xử lý đơn hàng | Bán hàng |
| Thanh toán tiền mặt & QR | Bán hàng |
| In hoá đơn nhiệt | Bán hàng |
| Mở / đóng ca & đối soát | Vận hành |
| Danh mục sản phẩm & biến thể | Catalog |
| Tồn kho realtime & cảnh báo | Kho |
| Phân quyền theo vai trò | Nhân sự |
| Báo cáo doanh thu cơ bản | Báo cáo |
| Onboarding & cấu hình tenant | Platform |
| Offline mode (≥ 2h) | Kỹ thuật | ⚪ Tạm hoãn |

#### 🟡 Quan trọng — Cần có trong Phase 1–2

| Tính năng | Module |
|---|---|
| Thanh toán chia nhóm / tách bill | Bán hàng |
| Hoàn trả / huỷ đơn có log | Bán hàng |
| Đặt bàn / order theo bàn | Bán hàng |
| Màn bếp KDS | Vận hành |
| Recipe / BOM nguyên liệu | Kho |
| Nhập hàng / phiếu PO | Kho |
| Lô hàng & hạn dùng | Kho |
| Hồ sơ khách hàng (SĐT) | CRM |
| Tích điểm & phân hạng | CRM |
| Engine khuyến mãi | CRM |
| Lãi gộp & phân tích sản phẩm | Báo cáo |
| Quản lý ca & chấm công | Nhân sự |

#### ⚪ Tùy chọn — Phase 3 hoặc theo yêu cầu

| Tính năng | Module |
|---|---|
| QR menu tự order | Bán hàng |
| Kiosk tự phục vụ | Bán hàng |
| Tích hợp Zalo OA thông báo | CRM |
| Quản lý đa chi nhánh | Platform |
| Tích hợp phần mềm kế toán | Platform |
| API mở cho bên thứ ba | Platform |
| Dashboard realtime nâng cao | Báo cáo |
| Dự báo nhu cầu / xu hướng | Báo cáo |

---

## 13. Roadmap

### Phase 0 — Nền móng & Setup ✅ (4 tuần · Sprint 1–2)

| Sprint | Tasks | Trạng thái |
|---|---|---|
| Sprint 1 | Tech stack, monorepo, Docker, CI/CD skeleton, env management | ✅ Hoàn thành |
| Sprint 2 | Platform DB, tenant schema provisioning, middleware, Auth JWT, role seed | ✅ Hoàn thành |

**Exit criteria đã đạt**: Tạo tenant, đăng nhập, middleware route đúng schema — không data leak.

**Exit checklist trước khi ra mắt (từng phase):**
- [ ] ~~Offline mode hoạt động — test với 30 phút không có mạng~~ (Tạm hoãn)
- Đối soát tiền mặt cuối ca — test với nhiều kịch bản chênh lệch
- Multi-tenant isolation — test không thể cross-tenant access
- Thanh toán QR — test cả webhook thành công, thất bại và đến trễ
- Backup và restore — test restore từ backup mất không quá 1 giờ
- Load test — ít nhất 50 concurrent users per tenant

---

### Phase 1 — MVP Bán hàng 🚧 (8 tuần · Sprint 3–6)

| Sprint | Tính năng | Trạng thái |
|---|---|---|
| Sprint 3 | Catalog: CRUD categories, products, variants, unit conversion | ✅ Hoàn thành |
| Sprint 4 | POS Core: Tạo đơn, modifier, Menu Grid, Quản lý bàn, Phân loại đơn, Auth Guard | ✅ Hoàn thành |
| Sprint 5 | Thanh toán (QR Stripe, Tiền mặt), In hóa đơn, Quản lý ca (mở/chốt, đối soát). | ✅ Hoàn thành |
| Sprint 6 | Kho cơ bản: stock movement, cảnh báo hết hàng | 🔲 |

**Exit criteria**: Bán hàng end-to-end — tạo đơn → thanh toán → trừ kho → in bill → đóng ca.

---

### Phase 2 — Vận hành đầy đủ 🔲 (8 tuần · Sprint 7–10)

| Sprint | Tính năng | Trạng thái |
|---|---|---|
| Sprint 7 | Nhập hàng: CRUD suppliers, purchase order, nhận hàng, cost_price | 🔲 |
| Sprint 8 | Recipe BOM & kiểm kê: ingredients, stock adjustment, đối chiếu | 🔲 |
| Sprint 9 | CRM & tích điểm: lookup khách, loyalty tier, hoàn điểm | 🔲 |
| Sprint 10 | Promotion engine: auto-apply, voucher, conflict resolution | 🔲 |

**Exit criteria**: Vận hành đầy đủ — nhập hàng, recipe, kiểm kê, loyalty, khuyến mãi tự động.

---

### Phase 3 — Báo cáo & Multi-loại hình 🔲 (8 tuần · Sprint 11–14)

| Sprint | Tính năng | Trạng thái |
|---|---|---|
| Sprint 11 | Dashboard: doanh thu, lãi gộp, top sản phẩm, export Excel/PDF | 🔲 |
| Sprint 12 | Nhân sự: CRUD users/roles, permission matrix, audit log | 🔲 |
| Sprint 13 | Module quán ăn: KDS realtime WebSocket, Chuyển/Gộp bàn nâng cao | 🔲 |
| Sprint 14 | Module tạp hóa: barcode, lô hàng/hạn dùng, onboarding wizard | 🔲 |

**Exit criteria**: 3 loại hình (cà phê, quán ăn, tạp hóa) tự onboard, cấu hình, vận hành không cần support.

---

### Buffer & Launch 🔲 (4 tuần · Sprint 15–16)

- Security audit
- Load testing & performance
- Backup & disaster recovery
- Bug bash với pilot users
- Polish UI/UX
- Production deployment

---

## 📎 Tài liệu liên quan

| Tài liệu | Đường dẫn |
|---|---|
| README | [`/README.md`](../README.md) |
| System Design | [`/docs/retail_system_design.docx`](./retail_system_design.docx) |
| Database Schema | [`/apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma) |
| Swagger (runtime) | `http://localhost:3000/docs` |
| Docker Compose | [`/docker-compose.yml`](../docker-compose.yml) |
| Env Example | [`/.env.example`](../.env.example) |

---

*© 2026 Retail SaaS — DatTT | MIT License*

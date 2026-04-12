# 🛒 Retail SaaS - Hệ thống Quản lý Bán lẻ Multi-tenant

> **Phase 0 — Foundation** | NestJS + Next.js + PostgreSQL + Redis

Hệ thống SaaS quản lý bán lẻ cho phép nhiều tenant (doanh nghiệp) vận hành trên cùng một nền tảng, mỗi tenant có dữ liệu hoàn toàn độc lập thông qua **PostgreSQL Schema Per Tenant**.

---

## 📦 Tech Stack

| Layer         | Technology                              |
| ------------- | ----------------------------------------|
| Backend       | NestJS (TypeScript) + Clean Architecture|
| ORM           | Prisma + PostgreSQL 15                  |
| Cache/Session | Redis 7                                 |
| Frontend      | Next.js 14 (App Router) + PWA           |
| State         | Zustand                                 |
| Container     | Docker + Docker Compose                 |
| Monorepo      | npm Workspaces + Turborepo              |

---

## 🏗️ Cấu trúc Project

```
retail-system/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts         # Entry point
│   │   │   ├── app.module.ts   # Root module
│   │   │   ├── common/         # Middleware, filters, guards, decorators
│   │   │   ├── config/         # App, DB, JWT, Redis configs
│   │   │   ├── database/       # PrismaService, PrismaModule
│   │   │   ├── infrastructure/ # Redis module & service
│   │   │   ├── modules/        # Feature modules (auth, tenant, user)
│   │   │   └── shared/         # Logger module
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── seeds/          # Seed data
│   │
│   └── web-pos/                # Next.js Frontend (POS)
│       └── src/
│           ├── app/            # App Router pages
│           ├── services/       # API service clients
│           ├── store/          # Zustand global state
│           └── offline/        # PWA offline handlers
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utility functions
│   ├── core/                   # Base classes, domain errors
│   ├── logger/                 # Winston logger wrapper
│   ├── event-bus/              # In-memory event system
│   └── database/               # Database helpers
│
├── infra/
│   ├── docker/
│   │   └── Dockerfile.api
│   └── scripts/
│       └── init-db.sql
│
├── docker-compose.yml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

---

## 🚀 Hướng dẫn chạy Local

### Yêu cầu

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** & **Docker Compose** >= v2

---

### Bước 1: Clone & Setup Environment

```bash
# Clone repo
git clone <repo-url>
cd retail-system

# Copy env file
cp .env.example .env

# Chỉnh sửa .env nếu cần (mặc định đã hoạt động với Docker)
```

---

### Bước 2: Khởi động Infrastructure (Docker)

```bash
# Start PostgreSQL + Redis
docker-compose up postgres redis -d

# Kiểm tra services đã healthy chưa
docker-compose ps
```

---

### Bước 3: Install Dependencies

```bash
npm install
```

---

### Bước 4: Database Migration & Seed

```bash
# Chạy Prisma migrations
npm run db:migrate

# Seed dữ liệu mặc định (Plans + Demo tenant + Admin user)
npm run db:seed
```

Sau khi seed xong:
- **Plans**: FREE, PRO, ENTERPRISE
- **Demo tenant**: slug = `demo`, schema = `tenant_demo`
- **Admin user**: `admin@demo.com` / `Demo@123456`

---

### Bước 5: Chạy Development Server

```bash
# Chạy tất cả services (API + Web POS)
npm run dev

# Hoặc chạy riêng từng service
npm run dev --workspace=apps/api      # API: http://localhost:3000
npm run dev --workspace=apps/web-pos  # POS: http://localhost:3001
```

---

### Bước 6: Chạy toàn bộ với Docker Compose

```bash
# Build và chạy tất cả
docker-compose up --build

# Chạy nền
docker-compose up -d

# Xem logs
docker-compose logs -f api
```

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:3000/api/v1`

**Bắt buộc**: Thêm header `X-Tenant-ID: demo` cho tất cả requests.

### Auth

| Method | Endpoint          | Mô tả                              |
| ------ | ----------------- | ----------------------------------- |
| POST   | `/auth/register`  | Đăng ký user mới trong tenant       |
| POST   | `/auth/login`     | Đăng nhập, nhận JWT token           |
| GET    | `/auth/me`        | Lấy thông tin user (cần JWT token)  |

### Tenant (Super Admin)

| Method | Endpoint         | Mô tả                  |
| ------ | ---------------- | ----------------------- |
| GET    | `/tenants`       | Danh sách tenants        |
| GET    | `/tenants/:id`   | Chi tiết tenant          |
| POST   | `/tenants`       | Tạo tenant mới           |

---

## 🧪 Test API

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo" \
  -d '{"name":"Test User","email":"test@demo.com","password":"Test@123456"}'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo" \
  -d '{"email":"admin@demo.com","password":"Demo@123456"}'

# 3. Get current user (thay <TOKEN> bằng token từ bước 2)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-ID: demo"
```

---

## 📖 Swagger Docs

Khi API đang chạy ở `development` mode:

```
http://localhost:3000/docs
```

---

## 🏛️ Kiến trúc Multi-Tenant

```
Request → TenantMiddleware → Validate Tenant → SET search_path → Route Handler
```

1. Client gửi request với header `X-Tenant-ID: demo`
2. `TenantMiddleware` lookup tenant trong `public.tenants`
3. Kiểm tra tenant status = `ACTIVE`
4. Gán `req.tenant` và có `SET search_path = "tenant_demo"`
5. Mọi Prisma query sau đó đều chạy trong schema `tenant_demo`

---

## 🗺️ Roadmap

- ✅ **Phase 0** — Foundation (hiện tại)
- ⬜ **Phase 1** — Product & Inventory Management
- ⬜ **Phase 2** — POS Transaction & Order Flow
- ⬜ **Phase 3** — Reporting & Analytics
- ⬜ **Phase 4** — Payment Integration
- ⬜ **Phase 5** — Mobile App (React Native)

---

## 📄 License

MIT © Retail SaaS Team

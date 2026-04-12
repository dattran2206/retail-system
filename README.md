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
│   ├── api/                    # NestJS Backend API
│   │   ├── prisma/             
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── seeds/          # Default admin & tenant seed data
│   │   ├── src/
│   │   │   ├── common/         # Middlewares, guards, filters, decorators
│   │   │   ├── config/         # System configurations
│   │   │   ├── database/       # Prisma initialization
│   │   │   ├── infrastructure/ # Redis & external services
│   │   │   ├── modules/        # Feature Modules
│   │   │   │   ├── auth/       # Authentication (JWT)
│   │   │   │   ├── tenant/     # Tenant management & schema prov.
│   │   │   │   ├── user/       # User management & Roles
│   │   │   │   ├── catalog/    # Product & Categories
│   │   │   │   ├── inventory/  # Stock management
│   │   │   │   ├── order/      # Transactions
│   │   │   │   └── ... (payment, staff, promotion, etc.)
│   │   │   ├── shared/         # Shared backend utilities
│   │   │   └── main.ts         # Entry point
│   │   └── package.json
│   │
│   └── web-pos/                # Next.js 14 Frontend POS
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # UI shared components
│       │   ├── lib/            # Utils & fetch wrappers
│       │   └── store/          # Zustand states
│       └── next.config.js
│
├── packages/                   # Monorepo Shared Libraries
│   ├── constants/              # Shared constants & enums
│   ├── core/                   # Domain entities & business rules
│   ├── database/               # Shared DB helpers
│   ├── event-bus/              # In-memory pub/sub
│   ├── handlers/               # Error handlers
│   ├── logger/                 # Unified Winston logger
│   ├── types/                  # Shared TypeScript interfaces
│   └── utils/                  # Helper functions
│
├── infra/                      # Infrastructure & DevOps
│   ├── docker/                 # Custom dockerfiles
│   └── scripts/                # Database/setup scripts
│
├── .env.example
├── docker-compose.yml          # Local infra (Postgres 55432 + Redis)
├── package.json                # Root workspaces
├── turbo.json                  # Turborepo config
└── tsconfig.base.json
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

## 🗺️ Roadmap (4 Phases - 16 Sprints - 8 Tháng)

### ✅ Phase 0: Nền móng & Setup (4 tuần · Sprint 1-2)
- **Sprint 1 (Tech stack & project skeleton):** Chọn & setup stack, Monorepo structure, CI/CD pipeline, Docker compose local, Env management.
- **Sprint 2 (Database & multi tenant foundation):** Platform DB migration, Tenant schema provisioning, Subdomain routing middleware, Auth (JWT + refresh token), Role & permission seed, Schema isolation test.
- **Exit criteria:** Tạo được tenant mới, đăng nhập, middleware route đúng schema — không có data leak giữa tenant.

### ⬜ Phase 1: MVP Bán hàng (8 tuần · Sprint 3-6)
- **Sprint 3 (Catalog & sản phẩm):** CRUD categories, CRUD products + variants, Unit conversion, Màn hình quản lý sản phẩm, Upload ảnh sản phẩm.
- **Sprint 4 (POS core — tạo & quản lý đơn):** Tạo order / thêm item, Modifier (size, topping), Huỷ món / huỷ đơn + log, Màn hình POS cashier, Menu grid có ảnh.
- **Sprint 5 (Thanh toán & ca làm việc):** Thanh toán tiền mặt / chuyển khoản, Split payment, Mở / đóng ca, Đối soát cuối ca, Màn hình thanh toán, Offline mode (IndexedDB).
- **Sprint 6 (Kho cơ bản & in bill):** Stock movement khi bán, Cảnh báo hết hàng, In bill (thermal printer), Màn hình tồn kho, Sync offline queue.
- **Exit criteria:** Bán hàng end-to-end hoàn chỉnh — tạo đơn, thanh toán, trừ kho, in bill, đóng ca ra báo cáo tiền mặt. Offline hoạt động được ít nhất 2 giờ không mạng.

### ⬜ Phase 2: Vận hành đầy đủ (8 tuần · Sprint 7-10)
- **Sprint 7 (Nhập hàng & nhà cung cấp):** CRUD suppliers, Purchase order flow, Nhận hàng → cộng kho, Cập nhật cost_price, Màn hình nhập hàng.
- **Sprint 8 (Recipe BOM & kiểm kê):** CRUD recipe / ingredients, Trừ kho theo recipe khi bán, Stock adjustment session, Đối chiếu kiểm kê, Màn hình kiểm kê.
- **Sprint 9 (CRM & tích điểm):** Lookup khách qua SĐT, Cộng / trừ điểm khi bán, Tier tự động recalculate, Hoàn điểm khi huỷ đơn, Màn hình hồ sơ khách.
- **Sprint 10 (Promotion engine & voucher):** Engine evaluate conditions, Auto-apply promotion, Voucher lookup & redeem, Promotion usage tracking, Conflict resolution (stackable).
- **Exit criteria:** Vận hành đầy đủ cho quán cà phê thực tế — nhập hàng, recipe, kiểm kê, khách hàng tích điểm, khuyến mãi tự động chạy đúng.

### ⬜ Phase 3: Báo cáo & Multi-loại hình (8 tuần · Sprint 11-14)
- **Sprint 11 (Dashboard báo cáo chủ cửa hàng):** Doanh thu theo giờ / ngày / tháng, Lãi gộp (revenue - COGS), Top sản phẩm bán chạy, Dashboard mobile-first, Export Excel / PDF.
- **Sprint 12 (Nhân sự & phân quyền):** CRUD users / roles, Permission matrix, Audit log mọi action nhạy cảm, Màn hình quản trị nhân viên.
- **Sprint 13 (Module quán ăn - Table + KDS):** Table management, Gộp / tách bàn, KDS realtime (WebSocket), Màn hình bếp KDS, WebSocket scale.
- **Sprint 14 (Module tạp hóa & onboarding):** Barcode scanner (camera), Lô hàng / hạn dùng, Tenant onboarding wizard, Config module theo store type, Billing & plan management.
- **Exit criteria:** 3 loại hình (cà phê, quán ăn, tạp hóa) onboard được độc lập. Chủ cửa hàng tự đăng ký, cấu hình, dùng được không cần support.

### ⬜ Buffer & Launch (4 tuần · Sprint 15-16)
- **Tasks:** Security audit, Load testing, Backup & disaster recovery, Bug bash với pilot users, Polish UI / UX, Production deployment.

---

## 📄 License

MIT © Retail System | DatTT

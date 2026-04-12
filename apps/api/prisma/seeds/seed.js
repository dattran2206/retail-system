"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// ================================================
// Database Seed - Dữ liệu mặc định ban đầu
// ================================================
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // ---- Seed Plans ----
    const plans = [
        {
            name: 'FREE',
            displayName: 'Miễn phí',
            price: 0,
            features: {
                maxUsers: 2,
                maxProducts: 100,
                maxBranches: 1,
                hasAnalytics: false,
                hasAPI: false,
                supportLevel: 'community',
            },
        },
        {
            name: 'PRO',
            displayName: 'Chuyên nghiệp',
            price: 299000,
            features: {
                maxUsers: 10,
                maxProducts: 5000,
                maxBranches: 3,
                hasAnalytics: true,
                hasAPI: true,
                supportLevel: 'email',
            },
        },
        {
            name: 'ENTERPRISE',
            displayName: 'Doanh nghiệp',
            price: 999000,
            features: {
                maxUsers: -1, // unlimited
                maxProducts: -1,
                maxBranches: -1,
                hasAnalytics: true,
                hasAPI: true,
                supportLevel: 'priority',
            },
        },
    ];
    for (const plan of plans) {
        const existing = await prisma.plan.findUnique({ where: { name: plan.name } });
        if (!existing) {
            await prisma.plan.create({ data: plan });
            console.log(`  ✅ Plan "${plan.name}" created`);
        }
        else {
            console.log(`  ⏭️  Plan "${plan.name}" already exists`);
        }
    }
    // ---- Seed Default Demo Tenant ----
    const freePlan = await prisma.plan.findUnique({ where: { name: 'FREE' } });
    if (freePlan) {
        const demoTenant = await prisma.tenant.upsert({
            where: { slug: 'demo' },
            update: {},
            create: {
                slug: 'demo',
                name: 'Demo Store',
                schemaName: 'tenant_demo',
                status: 'ACTIVE',
                planId: freePlan.id,
                email: 'demo@retailsaas.com',
            },
        });
        console.log(`  ✅ Demo tenant created: ${demoTenant.id}`);
        // ---- Seed Admin User for Demo Tenant ----
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
        const passwordHash = await bcrypt.hash('Demo@123456', 12);
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@demo.com' },
            update: {},
            create: {
                email: 'admin@demo.com',
                passwordHash,
                name: 'Demo Admin',
                role: 'TENANT_ADMIN',
                tenantId: demoTenant.id,
                isActive: true,
            },
        });
        console.log(`  ✅ Admin user created: ${adminUser.email}`);
    }
    console.log('✅ Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => {
    void prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
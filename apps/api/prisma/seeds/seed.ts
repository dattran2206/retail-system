import { PrismaClient } from '@prisma/client';

// ================================================
// Database Seed - Dữ liệu mặc định ban đầu
// ================================================

const prisma = new PrismaClient();

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
    } else {
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
    const bcrypt = await import('bcrypt');
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

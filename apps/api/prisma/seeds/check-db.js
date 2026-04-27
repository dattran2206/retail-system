const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:55432/retail_saas_platform?schema=tenant_demo"
    }
  }
});

async function check() {
  const areaCount = await prisma.area.count();
  const tableCount = await prisma.table.count();
  const areas = await prisma.area.findMany();
  console.log(`Areas: ${areaCount}`);
  console.log(`Tables: ${tableCount}`);
  console.log('Area names:', areas.map(a => a.name));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

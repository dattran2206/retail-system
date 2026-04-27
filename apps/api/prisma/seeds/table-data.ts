import { PrismaClient, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Areas and Tables for Tenant Demo...');

  // 1. Create Areas
  const areas = [
    { name: 'Tầng 1' },
    { name: 'Tầng 2' },
    { name: 'Sân thượng' },
    { name: 'Phòng VIP' },
  ];

  for (const a of areas) {
    const area = await prisma.area.create({
      data: { name: a.name }
    });
    console.log(`  ✅ Area created: ${area.name}`);

    // 2. Create Tables for each area
    const tableCount = a.name === 'Phòng VIP' ? 3 : 8;
    for (let i = 1; i <= tableCount; i++) {
      const tableName = `${a.name === 'Phòng VIP' ? 'VIP' : 'Bàn'} ${String(i).padStart(2, '0')}`;
      await prisma.table.create({
        data: {
          name: tableName,
          areaId: area.id,
          status: TableStatus.AVAILABLE
        }
      });
    }
    console.log(`     - Created ${tableCount} tables in ${area.name}`);
  }

  console.log('🏁 Table Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

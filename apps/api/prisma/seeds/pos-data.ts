import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding POS Catalog Data for Tenant Demo...');

  // Helper to get or create category
  const getOrCreateCategory = async (name: string, slug: string) => {
    const existing = await prisma.category.findFirst({ where: { slug } });
    if (existing) return existing;
    return prisma.category.create({ data: { name, slug } });
  };

  // 1. Create Categories
  const catCafe = await getOrCreateCategory('Cà phê', 'ca-phe');
  const catTea = await getOrCreateCategory('Trà trái cây', 'tra-trai-cay');

  console.log('  ✅ Categories checked/created');

  // 2. Create Modifier Groups (Upsert for idempotency)
  const upsertModifierGroup = async (data: any) => {
    const existing = await prisma.modifierGroup.findFirst({ where: { name: data.name } });
    if (existing) return existing;
    return prisma.modifierGroup.create({
      data: {
        name: data.name,
        selectionType: data.selectionType,
        minSelection: data.minSelection,
        maxSelection: data.maxSelection,
        modifiers: {
          create: data.modifiers
        }
      }
    });
  };

  const groupSugar = await upsertModifierGroup({
    name: 'Mức đường',
    selectionType: 'SINGLE',
    minSelection: 1,
    maxSelection: 1,
    modifiers: [
      { name: '100% Đường', price: 0 },
      { name: '70% Đường', price: 0 },
      { name: '50% Đường', price: 0 },
      { name: 'Không đường', price: 0 },
    ]
  });

  const groupIce = await upsertModifierGroup({
    name: 'Mức đá',
    selectionType: 'SINGLE',
    minSelection: 1,
    maxSelection: 1,
    modifiers: [
      { name: 'Đá bình thường', price: 0 },
      { name: 'Ít đá', price: 0 },
      { name: 'Không đá', price: 0 },
    ]
  });

  const groupTopping = await upsertModifierGroup({
    name: 'Topping',
    selectionType: 'MULTIPLE',
    minSelection: 0,
    maxSelection: 5,
    modifiers: [
      { name: 'Trân châu đen', price: 5000 },
      { name: 'Trân châu trắng', price: 8000 },
      { name: 'Thạch nha đam', price: 5000 },
      { name: 'Kem cheese', price: 10000 },
    ]
  });

  console.log('  ✅ Modifier Groups checked/created');

  // 3. Create Products (Check for existence)
  const createProductIfNotExists = async (data: any, tenantId: string, initialQuantity = 100) => {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
      include: { variants: true }
    });

    if (existing) {
      console.log(`  ⏭️  Product "${data.name}" already exists, updating stock levels to ${initialQuantity}...`);
      // Đảm bảo các variant có stock level
      for (const variant of existing.variants) {
        await prisma.stockLevel.upsert({
          where: { variantId: variant.id },
          update: { quantity: initialQuantity },
          create: {
            tenantId,
            variantId: variant.id,
            quantity: initialQuantity,
            minQuantity: 10,
          }
        });
      }
      return existing;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        categoryId: data.categoryId,
        baseUnit: data.baseUnit,
        imageUrl: data.imageUrl,
        variants: {
          create: data.variants
        },
        productModifiers: {
          create: data.modifierGroupIds.map((id: string) => ({ modifierGroupId: id }))
        }
      },
      include: { variants: true }
    });

    // Khởi tạo tồn kho cho variants mới tạo
    for (const variant of product.variants) {
      await prisma.stockLevel.create({
        data: {
          tenantId,
          variantId: variant.id,
          quantity: initialQuantity,
          minQuantity: 10,
        }
      });
    }

    console.log(`  ✅ Product "${data.name}" created with stock level ${initialQuantity}`);
    return product;
  };

  // 4. Get Demo Tenant
  const demoTenant = await prisma.tenant.findUnique({ where: { slug: 'demo' } });
  if (!demoTenant) {
    console.error('❌ Demo tenant not found. Please run seed.ts first.');
    return;
  }

  // Product 1: Cà phê sữa đá
  await createProductIfNotExists({
    name: 'Cà phê sữa đá',
    slug: 'ca-phe-sua-da',
    sku: 'CF-SD',
    categoryId: catCafe.id,
    baseUnit: 'Ly',
    imageUrl: 'https://img.freepik.com/free-photo/iced-coffee-with-milk-glass_144627-21142.jpg',
    variants: [
      { name: 'Size M', price: 29000, sku: 'CF-SD-M' },
      { name: 'Size L', price: 35000, sku: 'CF-SD-L' },
    ],
    modifierGroupIds: [groupIce.id]
  }, demoTenant.id);

  // Product 2: Trà đào cam sả
  await createProductIfNotExists({
    name: 'Trà đào cam sả',
    slug: 'tra-dao-cam-sa',
    sku: 'TEA-DCS',
    categoryId: catTea.id,
    baseUnit: 'Ly',
    imageUrl: 'https://img.freepik.com/free-photo/fresh-peach-tea-with-lemongrass-orange_144627-39322.jpg',
    variants: [
      { name: 'Size M', price: 45000, sku: 'TEA-DCS-M' },
      { name: 'Size L', price: 55000, sku: 'TEA-DCS-L' },
    ],
    modifierGroupIds: [groupSugar.id, groupIce.id, groupTopping.id]
  }, demoTenant.id);
  // Product 3: Bạc xỉu (Dùng để test Hết hàng)
  await createProductIfNotExists({
    name: 'Bạc xỉu (Hết hàng)',
    slug: 'bac-xiu',
    sku: 'CF-BX',
    categoryId: catCafe.id,
    baseUnit: 'Ly',
    imageUrl: 'https://img.freepik.com/free-photo/traditional-vietnamese-coffee-with-condensed-milk_144627-40012.jpg',
    variants: [
      { name: 'Mặc định', price: 32000, sku: 'CF-BX-DEF' },
    ],
    modifierGroupIds: [groupIce.id]
  }, demoTenant.id, 0); // Truyền thêm param quantity = 0

  console.log('🏁 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

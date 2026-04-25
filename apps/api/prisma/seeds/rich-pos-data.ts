import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding RICH POS Catalog Data for Tenant Demo...');

  // Helper to get or create category
  const getOrCreateCategory = async (name: string, slug: string) => {
    const existing = await prisma.category.findFirst({ where: { slug } });
    if (existing) return existing;
    return prisma.category.create({ data: { name, slug } });
  };

  // 1. Create Categories
  const catCoffee = await getOrCreateCategory('Cà phê', 'ca-phe');
  const catTea = await getOrCreateCategory('Trà trái cây', 'tra-trai-cay');
  const catPastry = await getOrCreateCategory('Bánh ngọt', 'banh-ngot');
  const catJuice = await getOrCreateCategory('Nước ép', 'nuoc-ep');

  // 2. Create Modifier Groups
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
      { name: 'Pudding trứng', price: 7000 },
    ]
  });

  // 3. Create Products Helper
  const createProduct = async (data: any) => {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      console.log(`  ⏭️  Product "${data.name}" already exists`);
      return existing;
    }
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        categoryId: data.categoryId,
        baseUnit: 'Ly',
        imageUrl: data.imageUrl,
        variants: {
          create: data.variants
        },
        productModifiers: {
          create: data.modifierGroupIds.map((id: string) => ({ modifierGroupId: id }))
        }
      }
    });
    console.log(`  ✅ Created: ${data.name}`);
    return product;
  };

  // --- COFFEE ---
  await createProduct({
    name: 'Cà phê sữa đá',
    slug: 'ca-phe-sua-da',
    sku: 'CF-SD',
    categoryId: catCoffee.id,
    imageUrl: 'https://img.freepik.com/free-photo/iced-coffee-with-milk-glass_144627-21142.jpg',
    variants: [
      { name: 'Size M', price: 29000, sku: 'CF-SD-M' },
      { name: 'Size L', price: 35000, sku: 'CF-SD-L' },
    ],
    modifierGroupIds: [groupIce.id]
  });

  await createProduct({
    name: 'Bạc xỉu',
    slug: 'bac-xiu',
    sku: 'CF-BX',
    categoryId: catCoffee.id,
    imageUrl: 'https://img.freepik.com/free-photo/coffee-cup-with-milk-foam_144627-18343.jpg',
    variants: [
      { name: 'Size M', price: 32000, sku: 'CF-BX-M' },
      { name: 'Size L', price: 39000, sku: 'CF-BX-L' },
    ],
    modifierGroupIds: [groupIce.id]
  });

  await createProduct({
    name: 'Cà phê đen đá',
    slug: 'ca-phe-den-da',
    sku: 'CF-DD',
    categoryId: catCoffee.id,
    imageUrl: 'https://img.freepik.com/free-photo/black-coffee-cup_144627-18342.jpg',
    variants: [
      { name: 'Size M', price: 25000, sku: 'CF-DD-M' },
      { name: 'Size L', price: 29000, sku: 'CF-DD-L' },
    ],
    modifierGroupIds: [groupSugar.id, groupIce.id]
  });

  // --- TEA ---
  await createProduct({
    name: 'Trà đào cam sả',
    slug: 'tra-dao-cam-sa',
    sku: 'TEA-DCS',
    categoryId: catTea.id,
    imageUrl: 'https://img.freepik.com/free-photo/fresh-peach-tea-with-lemongrass-orange_144627-39322.jpg',
    variants: [
      { name: 'Size M', price: 45000, sku: 'TEA-DCS-M' },
      { name: 'Size L', price: 55000, sku: 'TEA-DCS-L' },
    ],
    modifierGroupIds: [groupSugar.id, groupIce.id, groupTopping.id]
  });

  await createProduct({
    name: 'Trà thạch vải',
    slug: 'tra-thach-vai',
    sku: 'TEA-TV',
    categoryId: catTea.id,
    imageUrl: 'https://img.freepik.com/free-photo/fruit-iced-tea-glass_144627-18341.jpg',
    variants: [
      { name: 'Size M', price: 45000, sku: 'TEA-TV-M' },
      { name: 'Size L', price: 55000, sku: 'TEA-TV-L' },
    ],
    modifierGroupIds: [groupSugar.id, groupIce.id, groupTopping.id]
  });

  // --- JUICE ---
  await createProduct({
    name: 'Nước ép cam',
    slug: 'nuoc-ep-cam',
    sku: 'JUI-CAM',
    categoryId: catJuice.id,
    imageUrl: 'https://img.freepik.com/free-photo/orange-juice-glass_144627-18339.jpg',
    variants: [
      { name: 'Ly', price: 40000, sku: 'JUI-CAM-S' },
    ],
    modifierGroupIds: [groupIce.id]
  });

  await createProduct({
    name: 'Nước ép dưa hấu',
    slug: 'nuoc-ep-dua-hau',
    sku: 'JUI-DH',
    categoryId: catJuice.id,
    imageUrl: 'https://img.freepik.com/free-photo/watermelon-juice-glass_144627-18338.jpg',
    variants: [
      { name: 'Ly', price: 40000, sku: 'JUI-DH-S' },
    ],
    modifierGroupIds: [groupIce.id]
  });

  // --- PASTRY ---
  await createProduct({
    name: 'Croissant bơ pháp',
    slug: 'croissant-bo-phap',
    sku: 'PAS-CR',
    categoryId: catPastry.id,
    imageUrl: 'https://img.freepik.com/free-photo/fresh-baked-croissants_144627-18337.jpg',
    variants: [
      { name: 'Cái', price: 25000, sku: 'PAS-CR-S' },
    ],
    modifierGroupIds: []
  });

  await createProduct({
    name: 'Tiramisu',
    slug: 'tiramisu',
    sku: 'PAS-TM',
    categoryId: catPastry.id,
    imageUrl: 'https://img.freepik.com/free-photo/delicious-tiramisu-cake_144627-18336.jpg',
    variants: [
      { name: 'Hộp', price: 45000, sku: 'PAS-TM-S' },
    ],
    modifierGroupIds: []
  });

  console.log('🏁 Rich Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

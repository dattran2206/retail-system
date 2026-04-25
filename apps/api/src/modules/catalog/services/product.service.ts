import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { slugify } from '@retail-saas/utils';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip, take: limit,
        include: { 
          category: true, 
          variants: true, 
          unitConversions: true,
          productModifiers: {
            include: {
              modifierGroup: {
                include: { modifiers: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count()
    ]);

    return {
      data,
      meta: {
        total, page, limit, totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true, 
        variants: true, 
        unitConversions: true,
        productModifiers: {
          include: {
            modifierGroup: {
              include: { modifiers: true }
            }
          }
        }
      }
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.name);
    
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Product with slug ${slug} already exists`);

    if (dto.sku) {
      const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
      if (existingSku) throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException(`Category ${dto.categoryId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          sku: dto.sku,
          barcode: dto.barcode,
          description: dto.description,
          categoryId: dto.categoryId,
          baseUnit: dto.baseUnit,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive,
        }
      });

      // Tạo variants nếu có, hoặc tạo variant mặc định
      if (dto.variants && dto.variants.length > 0) {
        await tx.productVariant.createMany({
          data: dto.variants.map(v => ({
            productId: product.id,
            name: v.name,
            sku: v.sku,
            barcode: v.barcode,
            price: v.price,
            costPrice: v.costPrice,
            attributes: v.attributes as any,
            isActive: v.isActive,
          }))
        });
      } else {
        // Tạo variant mặc định
        await tx.productVariant.create({
          data: {
            productId: product.id,
            name: 'Default',
            sku: dto.sku,
            barcode: dto.barcode,
            price: 0,
            costPrice: 0,
          }
        });
      }

      return product;
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    let slug: string | undefined;
    
    if (dto.name) {
      slug = slugify(dto.name);
      const existing = await this.prisma.product.findFirst({ where: { slug, id: { not: id } } });
      if (existing) throw new ConflictException(`Product with slug ${slug} already exists`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) }
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({ where: { id } });
  }
}

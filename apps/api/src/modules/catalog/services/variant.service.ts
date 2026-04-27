import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from '../dto/variant.dto';

@Injectable()
export class VariantService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findById(id: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    return variant;
  }

  async create(dto: CreateVariantDto) {
    if (!dto.productId) throw new ConflictException(`productId is required`);
    
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    if (dto.sku) {
      const existing = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
      if (existing) throw new ConflictException(`Variant with SKU ${dto.sku} already exists`);
    }

    return this.prisma.productVariant.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateVariantDto) {
    await this.findById(id);
    if (dto.sku) {
      const existing = await this.prisma.productVariant.findFirst({ where: { sku: dto.sku, id: { not: id } } });
      if (existing) throw new ConflictException(`Variant with SKU ${dto.sku} already exists`);
    }
    const { productId, ...updateData } = dto;
    return this.prisma.productVariant.update({ where: { id }, data: updateData as any });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.productVariant.delete({ where: { id } });
  }
}

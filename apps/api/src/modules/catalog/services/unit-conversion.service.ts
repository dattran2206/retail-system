import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateUnitConversionDto, UpdateUnitConversionDto } from '../dto/unit-conversion.dto';

@Injectable()
export class UnitConversionService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.unitConversion.findMany({ where: { productId } });
  }

  async create(dto: CreateUnitConversionDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    return this.prisma.unitConversion.create({ data: dto });
  }

  async update(id: string, dto: UpdateUnitConversionDto) {
    const existing = await this.prisma.unitConversion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Unit conversion ${id} not found`);

    return this.prisma.unitConversion.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.unitConversion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Unit conversion ${id} not found`);

    return this.prisma.unitConversion.delete({ where: { id } });
  }
}

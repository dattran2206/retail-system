import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateModifierGroupDto, UpdateModifierGroupDto } from '../dto/modifier.dto';

@Injectable()
export class ModifierService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllGroups() {
    return this.prisma.modifierGroup.findMany({
      include: { modifiers: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findGroupById(id: string) {
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id },
      include: { modifiers: true },
    });
    if (!group) throw new NotFoundException(`ModifierGroup ${id} not found`);
    return group;
  }

  async createGroup(dto: CreateModifierGroupDto) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.modifierGroup.create({
        data: {
          name: dto.name,
          selectionType: dto.selectionType,
          minSelection: dto.minSelection,
          maxSelection: dto.maxSelection,
          isActive: dto.isActive,
        }
      });

      if (dto.modifiers && dto.modifiers.length > 0) {
        await tx.modifier.createMany({
          data: dto.modifiers.map(m => ({
            groupId: group.id,
            name: m.name,
            price: m.price,
            isActive: m.isActive
          }))
        });
      }

      return this.findGroupById(group.id);
    });
  }

  async updateGroup(id: string, dto: UpdateModifierGroupDto) {
    await this.findGroupById(id);
    return this.prisma.modifierGroup.update({
      where: { id },
      data: {
        name: dto.name,
        selectionType: dto.selectionType,
        minSelection: dto.minSelection,
        maxSelection: dto.maxSelection,
        isActive: dto.isActive,
      }
    });
  }

  async deleteGroup(id: string) {
    await this.findGroupById(id);
    return this.prisma.modifierGroup.delete({ where: { id } });
  }

  // Assign ModifierGroup to Product
  async assignToProduct(productId: string, modifierGroupId: string) {
    // Check if both exist
    await this.prisma.product.findUniqueOrThrow({ where: { id: productId } });
    await this.findGroupById(modifierGroupId);

    return this.prisma.productModifier.create({
      data: {
        productId,
        modifierGroupId
      }
    });
  }

  async removeFromProduct(productId: string, modifierGroupId: string) {
    return this.prisma.productModifier.delete({
      where: {
        productId_modifierGroupId: {
          productId,
          modifierGroupId
        }
      }
    });
  }
}

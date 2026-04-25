import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { slugify } from '@retail-saas/utils';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: { children: true },
      where: { parentId: null }, // Top level categories
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);
    
    // Check slug
    const existing = await this.prisma.category.findFirst({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category with slug ${slug} already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent category ${dto.parentId} not found`);
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id); // Check exists
    
    let slug: string | undefined;
    if (dto.name) {
      slug = slugify(dto.name);
      const existing = await this.prisma.category.findFirst({ 
        where: { slug, id: { not: id } } 
      });
      if (existing) {
        throw new ConflictException(`Category with slug ${slug} already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.category.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateAreaDto, UpdateAreaDto } from '../dto/area.dto';
import { CreateTableDto, UpdateTableDto } from '../dto/table.dto';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  // --- AREA ---
  async findAllAreas() {
    return this.prisma.area.findMany({
      include: { tables: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async createArea(dto: CreateAreaDto) {
    return this.prisma.area.create({ data: dto });
  }

  async updateArea(id: string, dto: UpdateAreaDto) {
    return this.prisma.area.update({ where: { id }, data: dto });
  }

  async removeArea(id: string) {
    return this.prisma.area.delete({ where: { id } });
  }

  // --- TABLE ---
  async findAllTables(areaId?: string) {
    return this.prisma.table.findMany({
      where: areaId ? { areaId } : {},
      include: { area: true },
      orderBy: { name: 'asc' }
    });
  }

  async findTableById(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: { area: true }
    });
    if (!table) throw new NotFoundException(`Table ${id} not found`);
    return table;
  }

  async createTable(dto: CreateTableDto) {
    return this.prisma.table.create({ data: dto });
  }

  async updateTable(id: string, dto: UpdateTableDto) {
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  async removeTable(id: string) {
    return this.prisma.table.delete({ where: { id } });
  }
}

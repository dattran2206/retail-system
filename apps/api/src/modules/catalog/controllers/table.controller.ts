import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TableService } from '../services/table.service';
import { CreateAreaDto, UpdateAreaDto } from '../dto/area.dto';
import { CreateTableDto, UpdateTableDto } from '../dto/table.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tables & Areas')
@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  // --- AREAS ---
  @Get('areas')
  @ApiOperation({ summary: 'Lấy danh sách tất cả khu vực' })
  findAllAreas() {
    return this.tableService.findAllAreas();
  }

  @Post('areas')
  createArea(@Body() dto: CreateAreaDto) {
    return this.tableService.createArea(dto);
  }

  @Patch('areas/:id')
  updateArea(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.tableService.updateArea(id, dto);
  }

  @Delete('areas/:id')
  removeArea(@Param('id') id: string) {
    return this.tableService.removeArea(id);
  }

  // --- TABLES ---
  @Get('tables')
  @ApiOperation({ summary: 'Lấy danh sách tất cả bàn' })
  findAllTables(@Query('areaId') areaId?: string) {
    return this.tableService.findAllTables(areaId);
  }

  @Get('tables/:id')
  findOneTable(@Param('id') id: string) {
    return this.tableService.findTableById(id);
  }

  @Post('tables')
  createTable(@Body() dto: CreateTableDto) {
    return this.tableService.createTable(dto);
  }

  @Patch('tables/:id')
  updateTable(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.tableService.updateTable(id, dto);
  }

  @Delete('tables/:id')
  removeTable(@Param('id') id: string) {
    return this.tableService.removeTable(id);
  }
}

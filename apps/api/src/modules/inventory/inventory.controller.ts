import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

class AdjustStockDto {
  @IsString()
  variantId: string;

  @IsInt()
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

class UpdateMinQuantityDto {
  @IsInt()
  @Min(0)
  minQuantity: number;
}

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('levels')
  @ApiOperation({ summary: 'Lấy danh sách tồn kho' })
  async getStockLevels(@Request() req: any) {
    return this.inventoryService.getStockLevels(req.user.tenantId);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Điều chỉnh kho thủ công' })
  async adjustStock(@Request() req: any, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(req.user.tenantId, {
      ...dto,
      createdBy: req.user.id,
      reason: dto.reason || 'Manual Adjustment',
    });
  }

  @Patch(':variantId/min-quantity')
  @ApiOperation({ summary: 'Cập nhật ngưỡng cảnh báo hết hàng' })
  async updateMinQuantity(
    @Request() req: any,
    @Body() dto: UpdateMinQuantityDto,
    @Param('variantId') variantId: string,
  ) {
    return this.inventoryService.updateMinQuantity(variantId, dto.minQuantity);
  }
}

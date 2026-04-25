import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VariantService } from '../services/variant.service';
import { CreateVariantDto, UpdateVariantDto } from '../dto/variant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Product Variants')
@Controller('catalog/variants')
@UseGuards(JwtAuthGuard)
export class VariantController {
  constructor(private readonly variantService: VariantService) {}

  @Post()
  create(@Body() createVariantDto: CreateVariantDto) {
    return this.variantService.create(createVariantDto);
  }

  @Get()
  findByProduct(@Query('productId') productId: string) {
    return this.variantService.findByProduct(productId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.variantService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVariantDto: UpdateVariantDto) {
    return this.variantService.update(id, updateVariantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantService.remove(id);
  }
}

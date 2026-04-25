import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UnitConversionService } from '../services/unit-conversion.service';
import { CreateUnitConversionDto, UpdateUnitConversionDto } from '../dto/unit-conversion.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Unit Conversions')
@Controller('catalog/unit-conversions')
@UseGuards(JwtAuthGuard)
export class UnitConversionController {
  constructor(private readonly unitConversionService: UnitConversionService) {}

  @Post()
  create(@Body() createUnitConversionDto: CreateUnitConversionDto) {
    return this.unitConversionService.create(createUnitConversionDto);
  }

  @Get()
  findByProduct(@Query('productId') productId: string) {
    return this.unitConversionService.findByProduct(productId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitConversionDto: UpdateUnitConversionDto) {
    return this.unitConversionService.update(id, updateUnitConversionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitConversionService.remove(id);
  }
}

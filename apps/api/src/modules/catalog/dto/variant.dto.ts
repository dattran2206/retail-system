import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiPropertyOptional({ example: 'uuid-product' })
  @IsString()
  @IsOptional()
  productId?: string; // Optional because it can be created alongside Product

  @ApiProperty({ example: 'Size L' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'CFS01-L' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: '8931234567891' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ example: { size: 'L' } })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateVariantDto extends PartialType(CreateVariantDto) { }

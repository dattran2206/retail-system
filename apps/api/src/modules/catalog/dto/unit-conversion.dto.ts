import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUnitConversionDto {
  @ApiProperty({ example: 'uuid-product' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'Thùng' })
  @IsString()
  @IsNotEmpty()
  fromUnit!: string;

  @ApiProperty({ example: 'Lon' })
  @IsString()
  @IsNotEmpty()
  toUnit!: string;

  @ApiProperty({ example: 24 })
  @IsNumber()
  @IsNotEmpty()
  conversionRate!: number;
}

export class UpdateUnitConversionDto extends PartialType(CreateUnitConversionDto) {}

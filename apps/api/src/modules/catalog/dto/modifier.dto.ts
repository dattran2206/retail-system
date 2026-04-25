import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ModifierSelection } from '@prisma/client';

export class CreateModifierItemDto {
  @ApiProperty({ example: 'Size L' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateModifierItemDto extends PartialType(CreateModifierItemDto) {}

export class CreateModifierGroupDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ModifierSelection, example: ModifierSelection.SINGLE })
  @IsEnum(ModifierSelection)
  @IsNotEmpty()
  selectionType!: ModifierSelection;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  minSelection!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  maxSelection!: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: () => [CreateModifierItemDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierItemDto)
  modifiers?: CreateModifierItemDto[];
}

export class UpdateModifierGroupDto extends PartialType(CreateModifierGroupDto) {}

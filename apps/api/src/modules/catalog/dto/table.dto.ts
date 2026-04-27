import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';

export class CreateTableDto {
  @ApiProperty({ example: 'Bàn 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'uuid-area-1' })
  @IsString()
  @IsNotEmpty()
  areaId: string;

  @ApiProperty({ enum: TableStatus, default: TableStatus.AVAILABLE, required: false })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTableDto {
  @ApiProperty({ example: 'Bàn 01 (Sửa)', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'uuid-area-2', required: false })
  @IsString()
  @IsOptional()
  areaId?: string;

  @ApiProperty({ enum: TableStatus, required: false })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

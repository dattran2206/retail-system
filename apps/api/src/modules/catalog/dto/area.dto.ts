import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({ example: 'Tầng 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAreaDto {
  @ApiProperty({ example: 'Tầng 1 (Sửa)', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

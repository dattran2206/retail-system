import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';

export class TenantDto {
  @ApiProperty({ description: 'ID Cửa hàng/Tenant', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Tên của cửa hàng/hệ thống', example: 'Cửa hàng tiện lợi A' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Đường dẫn slug (URL friendly). Nếu không truyền sẽ tự gen từ tên', example: 'cua-hang-tien-loi-a' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase letters, numbers, and dashes only',
  })
  @MaxLength(50)
  slug?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ', example: 'contact@storea.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ', example: 'Khu công nghệ cao, TP.HCM' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Plan ID đã đăng ký', example: 'PLAN-PRO' })
  @IsString()
  @IsOptional()
  planId?: string;
}

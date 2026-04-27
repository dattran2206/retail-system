import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenShiftDto {
  @ApiProperty({ example: 500000, description: 'Số tiền mặt đầu ca' })
  @IsNumber()
  @IsNotEmpty()
  openingBalance: number;

  @ApiPropertyOptional({ example: 'Ca sáng thứ Hai' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CloseShiftDto {
  @ApiProperty({ example: 1250000, description: 'Số tiền mặt thực đếm cuối ca' })
  @IsNumber()
  @IsNotEmpty()
  closingBalance: number;

  @ApiPropertyOptional({ example: 'Bàn giao cho ca chiều' })
  @IsString()
  @IsOptional()
  note?: string;
}

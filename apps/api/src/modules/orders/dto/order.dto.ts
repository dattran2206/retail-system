import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, OrderStatus } from '@prisma/client';

export class OrderItemModifierDto {
  @ApiProperty({ example: 'uuid-modifier' })
  @IsString()
  @IsNotEmpty()
  modifierId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'uuid-variant' })
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiPropertyOptional({ example: 'Ít đá' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ type: () => [OrderItemModifierDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemModifierDto)
  modifiers?: OrderItemModifierDto[];
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 10000 })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod!: PaymentMethod;

  @ApiProperty({ type: () => [CreateOrderItemDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Khách đổi ý' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

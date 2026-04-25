import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateOrderDto, CancelOrderDto } from '../dto/order.dto';
import { OrderStatus } from '@prisma/client';
import { generateId } from '@retail-saas/utils';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip, take: limit,
        include: {
          items: {
            include: { variant: true, modifiers: { include: { modifier: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count()
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { variant: true, modifiers: { include: { modifier: true } } }
        }
      }
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch pricing for variants and modifiers
      let totalAmount = 0;
      
      const orderItemsData = await Promise.all(dto.items.map(async (item) => {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId }
        });
        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);

        let itemTotal = Number(variant.price) * item.quantity;
        
        const modifiersData = [];
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            const modifierInfo = await tx.modifier.findUnique({ where: { id: mod.modifierId } });
            if (!modifierInfo) throw new NotFoundException(`Modifier ${mod.modifierId} not found`);
            
            const modPrice = Number(modifierInfo.price) * mod.quantity;
            itemTotal += modPrice;

            modifiersData.push({
              modifierId: mod.modifierId,
              quantity: mod.quantity,
              price: modifierInfo.price
            });
          }
        }

        totalAmount += itemTotal;

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          price: variant.price,
          note: item.note,
          modifiersData
        };
      }));

      // Apply discount
      const discount = dto.discount || 0;
      const finalAmount = totalAmount - discount;

      // 2. Generate Order Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderCount = await tx.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
      });
      const orderNumber = `ORD-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`;

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: OrderStatus.COMPLETED, // Theo yêu cầu MVP, tạo xong là COMPLETED
          totalAmount: finalAmount,
          discount: discount,
          paymentMethod: dto.paymentMethod,
        }
      });

      // 4. Create Order Items & Modifiers
      for (const item of orderItemsData) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            note: item.note
          }
        });

        if (item.modifiersData.length > 0) {
          await tx.orderItemModifier.createMany({
            data: item.modifiersData.map(m => ({
              orderItemId: orderItem.id,
              modifierId: m.modifierId,
              quantity: m.quantity,
              price: m.price
            }))
          });
        }
      }

      return this.findById(order.id);
    });
  }

  async cancel(id: string, dto: CancelOrderDto) {
    const order = await this.findById(id);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Order ${id} is already cancelled`);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelReason: dto.reason,
      }
    });
  }
}

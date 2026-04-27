import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateOrderDto, CancelOrderDto } from '../dto/order.dto';
import { OrderStatus, OrderType, TableStatus, MovementType } from '@prisma/client';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        skip, take: limit,
        include: {
          tenant: true,
          table: { include: { area: true } },
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
        tenant: true,
        table: { include: { area: true } },
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
      // 1. Validate Table if DINE_IN
      if (dto.orderType === OrderType.DINE_IN && !dto.tableId) {
        throw new BadRequestException('Bắt buộc chọn bàn cho đơn tại chỗ');
      }

      if (dto.tableId) {
        const table = await tx.table.findUnique({ where: { id: dto.tableId } });
        if (!table) throw new NotFoundException(`Bàn ${dto.tableId} không tồn tại`);
        if (table.status === TableStatus.OCCUPIED) {
           // Trong thực tế có thể cho phép gọi thêm món vào bàn đang dùng, 
           // nhưng để đơn giản cho MVP ta coi như tạo đơn mới thì bàn phải trống
           // hoặc xử lý logic gộp đơn sau.
        }
      }

      // 1. Fetch Shift & Tenant
      const shift = await tx.shift.findUnique({
        where: { id: dto.shiftId },
        select: { id: true, tenantId: true, userId: true }
      });
      if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc');

      // 1.5 Check Stock Availability
      await this.inventoryService.checkStockAvailability(
        shift.tenantId,
        dto.items.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
        tx
      );

      // 2. Fetch pricing for variants and modifiers
      let totalAmount = 0;
      
      const orderItemsData = await Promise.all(dto.items.map(async (item) => {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId }
        });
        if (!variant) throw new NotFoundException(`Biến thể ${item.variantId} không tồn tại`);

        let itemTotal = Number(variant.price) * item.quantity;
        
        const modifiersData = [];
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            const modifierInfo = await tx.modifier.findUnique({ where: { id: mod.modifierId } });
            if (!modifierInfo) throw new NotFoundException(`Topping ${mod.modifierId} không tồn tại`);
            
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

      const discount = dto.discount || 0;
      const finalAmount = totalAmount - discount;

      // 3. Generate Order Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderCount = await tx.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
      });
      const orderNumber = `ORD-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`;


      // 4. Create Order
      const order = await tx.order.create({
        data: {
          tenantId: shift.tenantId,
          orderNumber,
          status: OrderStatus.PENDING,
          orderType: dto.orderType,
          tableId: dto.tableId,
          shiftId: dto.shiftId,
          deliveryPartner: dto.deliveryPartner,
          customerName: dto.customerName,
          totalAmount: finalAmount,
          discount: discount,
          paymentMethod: dto.paymentMethod,
        }
      });

      // 5. Update Table Status if DINE_IN
      if (dto.orderType === OrderType.DINE_IN && dto.tableId) {
        await tx.table.update({
          where: { id: dto.tableId },
          data: { status: TableStatus.OCCUPIED }
        });
      }

      // 6. Create Order Items & Modifiers
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

      // Trả về đơn hàng kèm theo quan hệ (sử dụng tx thay vì this.findById)
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          tenant: true,
          table: { include: { area: true } },
          items: {
            include: { variant: true, modifiers: { include: { modifier: true } } }
          }
        }
      });
    });
  }

  async cancel(id: string, dto: CancelOrderDto) {
    const order = await this.findById(id);
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Đơn hàng ${id} đã bị hủy trước đó`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Nếu là đơn tại bàn, giải phóng bàn khi hủy đơn
      if (order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: { status: TableStatus.AVAILABLE }
        });
      }

      // Revert Stock for each item ONLY if order was COMPLETED
      if (order.status === OrderStatus.COMPLETED) {
        for (const item of order.items) {
          await this.inventoryService.recordMovement({
            tenantId: order.tenantId,
            variantId: item.variantId,
            type: MovementType.SALE_RETURN,
            quantity: item.quantity,
            referenceId: order.id,
            reason: dto.reason,
          }, tx);
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: dto.reason,
        }
      });
    });
  }
}

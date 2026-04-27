import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MovementType, Prisma } from '@prisma/client';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class InventoryService {
  private logger = new Logger('InventoryService');

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async getStockLevels(tenantId: string) {
    return this.prisma.stockLevel.findMany({
      where: { tenantId },
      include: {
        variant: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  async checkStockAvailability(tenantId: string, items: { variantId: string; quantity: number }[], tx?: any) {
    const client = tx || this.prisma;
    for (const item of items) {
      const stock = await client.stockLevel.findUnique({
        where: { variantId: item.variantId },
      });

      if (!stock || stock.quantity < item.quantity) {
        throw new ConflictException(`Insufficient stock for variant ${item.variantId}`);
      }
    }
  }

  async recordMovement(data: {
    tenantId: string;
    variantId: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    referenceId?: string;
    createdBy?: string;
  }, tx?: any) { // Sử dụng any hoặc Prisma.TransactionClient nếu có type
    const { tenantId, variantId, type, quantity, reason, referenceId, createdBy } = data;

    const isIncrement = ([
      MovementType.PURCHASE,
      MovementType.SALE_RETURN,
      MovementType.TRANSFER_IN,
      MovementType.ADJUSTMENT,
    ] as string[]).includes(type as string);

    const change = isIncrement ? quantity : -quantity;

    const execute = async (client: any) => {
      // 1. Ghi StockMovement
      const movement = await client.stockMovement.create({
        data: {
          tenantId,
          variantId,
          type,
          quantity,
          reason,
          referenceId,
          createdBy,
        },
      });

      // 2. Cập nhật StockLevel
      const oldStock = await client.stockLevel.findUnique({
        where: { variantId },
      });

      const updatedStock = await client.stockLevel.upsert({
        where: { variantId },
        create: {
          tenantId,
          variantId,
          quantity: change,
        },
        update: {
          quantity: { increment: change },
        },
      });

      // 3. Kiểm tra cảnh báo hết hàng
      if (
        updatedStock.quantity <= updatedStock.minQuantity &&
        (!oldStock || oldStock.quantity > oldStock.minQuantity)
      ) {
        this.logger.warn(`Low stock alert for ${variantId} in tenant ${tenantId}`);
        this.notificationGateway.sendToTenant(tenantId, 'inventory.low_stock', {
          variantId,
          quantity: updatedStock.quantity,
          minQuantity: updatedStock.minQuantity,
        });
      }

      return movement;
    };

    if (tx) {
      return execute(tx);
    }

    return this.prisma.$transaction(async (prismaTx: Prisma.TransactionClient) => {
      return execute(prismaTx);
    });
  }

  async updateMinQuantity(variantId: string, minQuantity: number) {
    return this.prisma.stockLevel.update({
      where: { variantId },
      data: { minQuantity },
    });
  }

  async adjustStock(tenantId: string, data: { variantId: string; quantity: number; reason: string; createdBy: string }) {
    return this.recordMovement({
      tenantId,
      variantId: data.variantId,
      type: MovementType.ADJUSTMENT,
      quantity: data.quantity,
      reason: data.reason,
      createdBy: data.createdBy,
    });
  }
}

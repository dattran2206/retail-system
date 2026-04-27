import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from './stripe.service';
import { OrderStatus, PaymentMethod, PaymentStatus, TableStatus, MovementType } from '@prisma/client';
import Stripe from 'stripe';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly inventoryService: InventoryService,
  ) {}

  async payWithCash(orderId: string, shiftId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { 
          payments: true,
          items: true,
          shift: true
        }
      });

      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.status === OrderStatus.COMPLETED) {
        throw new BadRequestException('Đơn hàng đã hoàn thành trước đó');
      }

      await tx.payment.create({
        data: {
          tenantId: order.tenantId,
          orderId,
          shiftId,
          method: PaymentMethod.CASH,
          amount: order.totalAmount,
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: OrderStatus.COMPLETED,
          shiftId: shiftId,
          paymentMethod: PaymentMethod.CASH 
        }
      });

      await tx.shift.update({
        where: { id: shiftId },
        data: {
          cashRevenue: { increment: order.totalAmount },
          totalOrders: { increment: 1 }
        }
      });

      if (order.tableId) {
        await tx.table.update({
          where: { id: order.tableId },
          data: { status: TableStatus.AVAILABLE }
        });
      }

      // 4. Trừ kho chính thức
      for (const item of order.items) {
        await this.inventoryService.recordMovement({
          tenantId: order.tenantId,
          variantId: item.variantId,
          type: MovementType.SALE,
          quantity: item.quantity,
          referenceId: order.id,
          createdBy: order.shift?.userId,
        }, tx);
      }

      return { success: true, orderId };
    });
  }

  async createTransferPayment(orderId: string, shiftId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // Tạo Stripe Checkout Session
    const session = await this.stripeService.createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.totalAmount),
      description: `Thanh toán đơn hàng #${order.orderNumber}`,
    });

    // Lưu Payment PENDING với Stripe session info
    const payment = await this.prisma.payment.create({
      data: {
        tenantId: order.tenantId,
        orderId,
        shiftId,
        method: PaymentMethod.TRANSFER,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
        checkoutUrl: session.checkoutUrl,
        stripeSessionId: session.sessionId,
      }
    });

    return payment;
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    let event: any;

    try {
      event = this.stripeService.constructWebhookEvent(payload, signature);
    } catch (err: any) {
      this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        this.logger.warn('Stripe webhook: missing orderId in metadata');
        return { received: true };
      }

      await this.completeTransferPayment(orderId, session.id, session.payment_intent as string);
    }

    return { received: true };
  }

  private async completeTransferPayment(orderId: string, sessionId: string, paymentIntentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { orderId, status: PaymentStatus.PENDING, method: PaymentMethod.TRANSFER },
        include: { 
          order: {
            include: { items: true, shift: true }
          }
        }
      });

      if (!payment) {
        this.logger.warn(`No pending payment found for order ${orderId}`);
        return;
      }

      // 1. Cập nhật Payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId,
        }
      });

      // 2. Cập nhật Order
      await tx.order.update({
        where: { id: payment.orderId },
        data: { 
          status: OrderStatus.COMPLETED,
          paymentMethod: PaymentMethod.TRANSFER 
        }
      });

      // 3. Cập nhật Shift
      if (payment.shiftId) {
        await tx.shift.update({
          where: { id: payment.shiftId },
          data: {
            transferRevenue: { increment: payment.amount },
            totalOrders: { increment: 1 }
          }
        });
      }

      // 4. Giải phóng bàn
      if (payment.order.tableId) {
        await tx.table.update({
          where: { id: payment.order.tableId },
          data: { status: TableStatus.AVAILABLE }
        });
      }

      // 5. Trừ kho chính thức
      for (const item of payment.order.items) {
        await this.inventoryService.recordMovement({
          tenantId: payment.tenantId,
          variantId: item.variantId,
          type: MovementType.SALE,
          quantity: item.quantity,
          referenceId: payment.orderId,
          createdBy: payment.order.shift?.userId,
        }, tx);
      }

      this.logger.log(`✅ Stripe payment completed for order ${payment.order.orderNumber}`);
    });
  }

  async getPaymentStatus(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id }
    });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');
    return { status: payment.status };
  }
}

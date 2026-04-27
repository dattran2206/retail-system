import { Controller, Post, Body, Param, Get, UseGuards, Req, HttpCode, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('pos/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('cash')
  @ApiOperation({ summary: 'Thanh toán bằng tiền mặt' })
  payWithCash(@Body() body: { orderId: string, shiftId: string }) {
    return this.paymentService.payWithCash(body.orderId, body.shiftId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  @ApiOperation({ summary: 'Tạo Stripe Checkout Session (QR/Chuyển khoản)' })
  createTransfer(@Body() body: { orderId: string, shiftId: string }) {
    return this.paymentService.createTransferPayment(body.orderId, body.shiftId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán' })
  getStatus(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }
}

@ApiTags('Payments Webhook')
@Controller('payments')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook nhận thông báo từ Stripe' })
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    return this.paymentService.handleStripeWebhook(req.rawBody, signature);
  }
}

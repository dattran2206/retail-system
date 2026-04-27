import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly webhookSecret: string;
  private readonly successUrl: string;
  private readonly cancelUrl: string;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    this.webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    this.successUrl = this.configService.get<string>('stripe.successUrl');
    this.cancelUrl = this.configService.get<string>('stripe.cancelUrl');

    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY is missing! Payment features will not work.');
    }

    this.stripe = new Stripe(secretKey || '', {
      apiVersion: '2025-03-31.basil',
    });

    this.logger.log('Stripe initialized (test mode)');
  }

  async createCheckoutSession(orderData: {
    orderId: string;
    orderNumber: string;
    amount: number; // VND (đơn vị nhỏ nhất, không cần nhân 100)
    description: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `Đơn hàng #${orderData.orderNumber}`,
              description: orderData.description,
            },
            unit_amount: orderData.amount, // VND không có đơn vị thập phân
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
      metadata: {
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }
}

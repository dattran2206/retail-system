import { Module } from '@nestjs/common';
import { PaymentController, PaymentWebhookController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';

import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, StripeService],
  exports: [PaymentService],
})
export class PaymentModule {}

import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Config
import { allConfigs } from './config/configuration';

// Database
import { PrismaModule } from './database/prisma.module';

// Infrastructure
import { RedisModule } from './infrastructure/redis/redis.module';

// Shared
import { AppLoggerModule } from './shared/logger/logger.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';

// Middleware
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ShiftModule } from './modules/shift/shift.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { InventoryModule } from './modules/inventory/inventory.module';

// ================================================
// AppModule - Root Application Module
// ================================================

@Module({
  imports: [
    // Config (global, đọc từ .env)
    ConfigModule.forRoot({
      isGlobal: true,
      load: allConfigs,
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),

    // Database
    PrismaModule,

    // Infrastructure
    RedisModule,

    // Logger
    AppLoggerModule,

    // Feature Modules
    AuthModule,
    TenantModule,
    UserModule,
    CatalogModule,
    OrdersModule,
    ShiftModule,
    PaymentModule,
    NotificationModule,
    InventoryModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Apply TenantMiddleware cho tất cả routes
   * Middleware này sẽ resolve tenant từ mỗi request
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'payments/webhook', method: RequestMethod.POST }
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

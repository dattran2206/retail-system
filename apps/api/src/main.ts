import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppLoggerService } from './shared/logger/logger.service';

// ================================================
// main.ts - NestJS Application Bootstrap
// ================================================

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true, // Cần cho Stripe webhook signature verification
  });

  // ---- Logger ----
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // ---- Config ----
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') || 3000;
  const apiPrefix = config.get<string>('app.apiPrefix');
  const corsOrigins = config.get<string[]>('app.corsOrigins') || ['http://localhost:3001'];
  const isProduction = config.get<boolean>('app.isProduction') || false;

  // ---- Security ----
  app.use(helmet());

  // ---- CORS ----
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
  });

  // ---- Global Prefix ----
  if (apiPrefix && apiPrefix !== '/') {
    app.setGlobalPrefix(apiPrefix);
  }

  // ---- Versioning (Disabled per user request) ----
  /*
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  */

  // ---- Global Pipes ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Xóa fields không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field lạ
      transform: true,           // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---- Global Filters ----
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ---- Global Interceptors ----
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ---- Swagger (chỉ trong development) ----
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Retail SaaS API')
      .setDescription('Multi-tenant Retail Management System API')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'X-Tenant-ID')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // ---- Graceful Shutdown ----
  app.enableShutdownHooks();

  // ---- Start Server ----
  await app.listen(port);

  logger.log(`🚀 API Server running on http://localhost:${port}${apiPrefix}`);
  if (!isProduction) {
    logger.log(`📖 Swagger docs: http://localhost:${port}/docs`);
  }
}

bootstrap().catch((err: unknown) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});

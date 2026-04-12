import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// ================================================
// PrismaService - Database Connection & Multi-tenant support
// ================================================

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');

      // Log slow queries trong development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.$on as any)('query', (e: { query: string; duration: number }) => {
          if (e.duration > 1000) {
            this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
          }
        });
      }
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Set PostgreSQL search_path cho multi-tenant
   * Được gọi bởi TenantMiddleware trước mỗi request
   */
  async setTenantSchema(schemaName: string): Promise<void> {
    await this.$executeRawUnsafe(`SET search_path = "${schemaName}", public`);
  }

  /**
   * Reset search_path về public
   */
  async resetSchema(): Promise<void> {
    await this.$executeRawUnsafe('SET search_path = public');
  }

  /**
   * Tạo schema mới cho tenant
   */
  async createTenantSchema(schemaName: string): Promise<void> {
    await this.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    this.logger.log(`Schema "${schemaName}" created`);
  }

  /**
   * Kiểm tra schema đã tồn tại chưa
   */
  async schemaExists(schemaName: string): Promise<boolean> {
    const result = await this.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = ${schemaName}
      ) as exists
    `;
    return result[0]?.exists ?? false;
  }

  /**
   * Health check connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

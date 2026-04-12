import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

// ================================================
// TenantMiddleware - Multi-Tenant Request Handler
// ================================================
// Lấy tenant từ header X-Tenant-ID hoặc subdomain
// Validate tenant tồn tại và ACTIVE
// Set req.tenant và PostgreSQL search_path

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    slug: string;
    schemaName: string;
    status: string;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: TenantRequest, _res: Response, next: NextFunction): Promise<void> {
    const tenantIdentifier = this.extractTenantIdentifier(req);

    if (!tenantIdentifier) {
      throw new BadRequestException({
        error: {
          code: 'TENANT_REQUIRED',
          message: 'Tenant identifier is required. Provide X-Tenant-ID header or use tenant subdomain.',
        },
      });
    }

    // Tìm tenant trong database
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantIdentifier },
      select: {
        id: true,
        slug: true,
        schemaName: true,
        status: true,
      },
    });

    if (!tenant) {
      throw new UnauthorizedException({
        error: {
          code: 'TENANT_NOT_FOUND',
          message: `Tenant "${tenantIdentifier}" not found`,
        },
      });
    }

    if (tenant.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        error: {
          code: 'TENANT_INACTIVE',
          message: `Tenant "${tenantIdentifier}" is ${tenant.status.toLowerCase()}`,
        },
      });
    }

    // Gán tenant vào request
    req.tenant = tenant;

    // Set PostgreSQL search_path cho request này
    await this.prisma.setTenantSchema(tenant.schemaName);

    this.logger.debug(`Tenant resolved: ${tenant.slug} (${tenant.schemaName})`);

    next();
  }

  /**
   * Lấy tenant identifier từ:
   * 1. Header X-Tenant-ID (ưu tiên)
   * 2. Subdomain (my-store.retailsaas.com)
   */
  private extractTenantIdentifier(req: Request): string | null {
    // 1. Header (ưu tiên cho API clients, mobile apps)
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId && typeof headerTenantId === 'string') {
      return headerTenantId.toLowerCase().trim();
    }

    // 2. Subdomain extraction
    const host = req.headers.host || '';
    const hostParts = host.split('.');

    // Nếu có format: tenant.domain.com (ít nhất 3 parts)
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0];
      // Bỏ qua www, api, app
      if (!['www', 'api', 'app', 'admin'].includes(subdomain)) {
        return subdomain.toLowerCase();
      }
    }

    return null;
  }
}

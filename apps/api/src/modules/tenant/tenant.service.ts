import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { slugify, toSchemaName, isValidSlug } from '@retail-saas/utils';
import { TenantStatus } from '@retail-saas/types';

// ================================================
// TenantService - Tenant Management
// ================================================

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm tenant theo slug
   */
  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { plan: true },
    });
    return tenant;
  }

  /**
   * Tìm tenant theo ID
   */
  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!tenant) {
      throw new NotFoundException({
        error: { code: 'TENANT_NOT_FOUND', message: `Tenant ${id} not found` },
      });
    }

    return tenant;
  }

  /**
   * Lấy danh sách tenants (admin only)
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take: limit,
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Tạo tenant mới
   */
  async create(dto: CreateTenantDto) {
    const slug = slugify(dto.slug || dto.name);

    if (!isValidSlug(slug)) {
      throw new BadRequestException({
        error: {
          code: 'INVALID_SLUG',
          message: `Invalid slug: "${slug}". Use only lowercase letters, numbers, and dashes.`,
        },
      });
    }

    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException({
        error: {
          code: 'TENANT_SLUG_TAKEN',
          message: `Tenant with slug "${slug}" already exists`,
        },
      });
    }

    const schemaName = toSchemaName(slug);

    // Lấy Free plan mặc định
    const defaultPlan = await this.prisma.plan.findUnique({
      where: { name: 'FREE' },
    });

    if (!defaultPlan) {
      throw new Error('Default FREE plan not found. Run database seed first.');
    }

    // Create tenant record
    const tenant = await this.prisma.tenant.create({
      data: {
        slug,
        name: dto.name,
        schemaName,
        status: TenantStatus.ACTIVE,
        planId: dto.planId || defaultPlan.id,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      },
      include: { plan: true },
    });

    // Create PostgreSQL schema cho tenant
    await this.createTenantSchema(schemaName);

    this.logger.log(`Tenant created: ${tenant.slug} (schema: ${schemaName})`);

    return tenant;
  }

  /**
   * Tạo PostgreSQL schema cho tenant mới
   */
  async createTenantSchema(schemaName: string): Promise<void> {
    const exists = await this.prisma.schemaExists(schemaName);
    if (!exists) {
      await this.prisma.createTenantSchema(schemaName);
      this.logger.log(`Schema "${schemaName}" created`);
    } else {
      this.logger.debug(`Schema "${schemaName}" already exists`);
    }
  }

  /**
   * Cập nhật trạng thái tenant
   */
  async updateStatus(id: string, status: TenantStatus) {
    return this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// ================================================
// UserService - User CRUD Operations
// ================================================

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm user theo ID trong tenant
   */
  async findById(id: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
    });
  }

  /**
   * Tìm user theo email trong tenant
   */
  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  /**
   * Tạo user mới
   */
  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    tenantId: string;
    role?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        tenantId: data.tenantId,
        role: (data.role as 'CASHIER') || 'CASHIER',
      },
    });
  }

  /**
   * Cập nhật thời gian đăng nhập cuối
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Lấy danh sách users trong tenant
   */
  async findAllByTenant(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { tenantId } }),
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
   * Deactivate user
   */
  async deactivate(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    this.logger.log(`User ${userId} deactivated`);
  }
}

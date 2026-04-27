import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OpenShiftDto, CloseShiftDto } from './dto/shift.dto';
import { ShiftStatus } from '@prisma/client';

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentShift(userId: string) {
    if (!userId) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng (UserID undefined)');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true }
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const shift = await this.prisma.shift.findFirst({
      where: {
        userId,
        tenantId: user.tenantId,
        status: ShiftStatus.OPEN,
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!shift) return null;

    // Chuyển đổi để khớp với interface Frontend
    return {
      ...shift,
      totalOrders: shift._count.orders
    };
  }

  async openShift(userId: string, dto: OpenShiftDto) {
    // 1. Kiểm tra xem user có ca nào đang mở không
    const existingShift = await this.getCurrentShift(userId);
    if (existingShift) {
      throw new BadRequestException('Bạn đang có một ca làm việc chưa kết thúc');
    }

    // 2. Tạo ca mới
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true }
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      const createData = {
        tenantId: user.tenantId,
        userId,
        openingBalance: dto.openingBalance.toString(), // Chuyển sang string để Prisma Decimal xử lý chuẩn
        note: dto.note || '',
        status: ShiftStatus.OPEN,
      };

      console.log('DỮ LIỆU TẠO CA:', createData);

      return await this.prisma.shift.create({
        data: createData,
      });
    } catch (error: any) {
      console.error('LỖI TẠO CA LÀM VIỆC CHI TIẾT:');
      console.error('- Message:', error.message);
      console.error('- Code:', error.code);
      console.error('- Meta:', error.meta);
      throw error;
    }
  }

  async closeShift(userId: string, id: string, dto: CloseShiftDto) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    });

    if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc');
    if (shift.userId !== userId) throw new BadRequestException('Bạn không có quyền chốt ca này');
    if (shift.status === ShiftStatus.CLOSED) throw new BadRequestException('Ca này đã được chốt trước đó');

    // Tính toán chênh lệch
    // Sổ sách = Tiền đầu ca + Doanh thu tiền mặt
    const expectedCash = Number(shift.openingBalance) + Number(shift.cashRevenue);
    const difference = Number(dto.closingBalance) - expectedCash;

    return this.prisma.shift.update({
      where: { id },
      data: {
        status: ShiftStatus.CLOSED,
        closedAt: new Date(),
        closingBalance: dto.closingBalance,
        difference: difference,
        note: dto.note ? `${shift.note || ''} | Chốt: ${dto.note}` : shift.note,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.shift.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.shift.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!shift) throw new NotFoundException('Không tìm thấy ca làm việc');
    return shift;
  }
}

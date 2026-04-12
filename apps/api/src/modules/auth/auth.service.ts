import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload, AuthTokens } from '@retail-saas/types';

// ================================================
// AuthService - Authentication Logic
// ================================================

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký user mới trong tenant
   */
  async register(dto: RegisterDto, tenantId: string) {
    // Kiểm tra email đã tồn tại trong tenant chưa
    const existingUser = await this.userService.findByEmail(dto.email, tenantId);
    if (existingUser) {
      throw new ConflictException({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: `Email "${dto.email}" is already registered`,
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Tạo user
    const user = await this.userService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      tenantId,
    });

    this.logger.log(`User registered: ${user.email} (tenant: ${tenantId})`);

    // Trả về user không kèm password
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Đăng nhập và trả về JWT tokens
   */
  async login(dto: LoginDto, tenantId: string) {
    const user = await this.userService.findByEmail(dto.email, tenantId);

    if (!user) {
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or password is incorrect',
        },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'Your account has been disabled',
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or password is incorrect',
        },
      });
    }

    // Tạo JWT tokens
    const tokens = await this.generateTokens(user, tenantId);

    // Update lastLoginAt
    await this.userService.updateLastLogin(user.id);

    this.logger.log(`User logged in: ${user.email} (tenant: ${tenantId})`);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Lấy thông tin user hiện tại từ JWT payload
   */
  async getMe(userId: string, tenantId: string) {
    const user = await this.userService.findById(userId, tenantId);
    if (!user) {
      throw new UnauthorizedException({
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Generate access + refresh tokens
   */
  private async generateTokens(
    user: { id: string; email: string; role: string; tenantId: string },
    tenantId: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      tenantId,
      tenantSlug: '', // Sẽ được set từ tenant context
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }
}

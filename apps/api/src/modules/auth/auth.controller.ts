import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { JwtPayload, TenantContext } from '@retail-saas/types';

// ================================================
// AuthController - Authentication Endpoints
// ================================================

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Đăng ký user mới trong tenant hiện tại
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() dto: RegisterDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.authService.register(dto, tenant.id);
  }

  /**
   * POST /auth/login
   * Đăng nhập và nhận JWT tokens
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() dto: LoginDto,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.authService.login(dto, tenant.id);
  }

  /**
   * GET /auth/me
   * Lấy thông tin user hiện tại (cần JWT token)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.authService.getMe(user.sub, tenant.id);
  }
}

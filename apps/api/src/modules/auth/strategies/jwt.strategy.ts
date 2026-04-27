import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import type { JwtPayload } from '@retail-saas/types';

// ================================================
// JwtStrategy - Passport JWT Strategy
// ================================================

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'change-me',
    });
  }

  /**
   * Validate JWT payload và return user object
   * Được Passport gắn vào req.user
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, tenantId: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Token is invalid or user is inactive',
        },
      });
    }

    return {
      ...payload,
      id: user.id,
      tenantId: user.tenantId,
    };
  }
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { JwtPayload } from '@retail-saas/types';
import { UserRole } from '@retail-saas/types';

// ================================================
// RolesGuard - Role-based Access Control
// ================================================

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không yêu cầu role cụ thể, cho phép
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: Authentication required',
        },
      });
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      throw new ForbiddenException({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied: Required roles: ${requiredRoles.join(', ')}`,
        },
      });
    }

    return true;
  }
}

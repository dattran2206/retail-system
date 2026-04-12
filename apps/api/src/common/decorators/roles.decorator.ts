import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@retail-saas/types';

export const ROLES_KEY = 'roles';

/**
 * Decorator để chỉ định roles được phép access endpoint
 * @example @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

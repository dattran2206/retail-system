import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TenantContext } from '@retail-saas/types';

/**
 * Decorator lấy tenant context từ request
 * @example getTenant(@CurrentTenant() tenant: TenantContext)
 */
export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = ctx.switchToHttp().getRequest<any>();
    const tenant = request.tenant as TenantContext;
    return data ? tenant?.[data] : tenant;
  },
);

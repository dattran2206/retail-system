import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '@retail-saas/types';

/**
 * Decorator lấy user hiện tại từ request (sau khi JWT validate)
 * @example getCurrentUser(@CurrentUser() user: JwtPayload)
 * @example getCurrentUserId(@CurrentUser('sub') userId: string)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

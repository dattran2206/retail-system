import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

// ================================================
// LoggingInterceptor - HTTP Request/Response Logger
// ================================================

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const { method, path, ip } = req;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenantId = (req as any).tenant?.id || 'unknown';
    const startTime = Date.now();

    this.logger.log(
      `→ ${method} ${path} | Tenant: ${tenantId} | IP: ${ip}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(
            `← ${method} ${path} ${statusCode} | ${duration}ms | Tenant: ${tenantId}`,
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `← ${method} ${path} ERROR | ${duration}ms | Tenant: ${tenantId}`,
            err instanceof Error ? err.stack : err,
          );
        },
      }),
    );
  }
}

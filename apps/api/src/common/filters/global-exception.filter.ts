import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

// ================================================
// GlobalExceptionFilter - Standard Error Response
// ================================================
// Format tất cả lỗi thành:
// { success: false, error: { code, message, details? } }

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, errorCode, message, details } = this.parseException(exception);

    // Log lỗi
    const logContext = {
      method: request.method,
      path: request.path,
      statusCode,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tenantId: (request as any).tenant?.id,
    };

    if (statusCode >= 500) {
      this.logger.error(`${request.method} ${request.path} - ${message}`, exception, logContext);
    } else {
      this.logger.warn(`${request.method} ${request.path} - ${message}`, logContext);
    }

    response.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details ? { details } : {}),
        timestamp: new Date().toISOString(),
        path: request.path,
      },
    });
  }

  private parseException(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string;
    details?: unknown;
  } {
    // NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const res = response as Record<string, unknown>;

        // Nếu đã có format { error: { code, message } }
        if (res.error && typeof res.error === 'object') {
          const err = res.error as Record<string, unknown>;
          return {
            statusCode: status,
            errorCode: (err.code as string) || this.httpStatusToCode(status),
            message: (err.message as string) || exception.message,
            details: err.details,
          };
        }

        // NestJS validation errors (ValidationPipe)
        if (Array.isArray(res.message)) {
          return {
            statusCode: status,
            errorCode: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { fields: res.message },
          };
        }

        return {
          statusCode: status,
          errorCode: this.httpStatusToCode(status),
          message: (res.message as string) || exception.message,
        };
      }

      return {
        statusCode: status,
        errorCode: this.httpStatusToCode(status),
        message: exception.message,
      };
    }

    // Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'DATABASE_VALIDATION_ERROR',
        message: 'Invalid database query',
      };
    }

    // Unknown errors
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: isProduction
        ? 'An unexpected error occurred'
        : (exception instanceof Error ? exception.message : 'Unknown error'),
    };
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    errorCode: string;
    message: string;
  } {
    switch (error.code) {
      case 'P2002': // Unique constraint
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: 'DUPLICATE_ENTRY',
          message: `A record with this value already exists`,
        };
      case 'P2025': // Record not found
        return {
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: 'RECORD_NOT_FOUND',
          message: 'Record not found',
        };
      case 'P2003': // Foreign key constraint
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: 'FOREIGN_KEY_VIOLATION',
          message: 'Related record not found',
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: 'DATABASE_ERROR',
          message: 'Database operation failed',
        };
    }
  }

  private httpStatusToCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}

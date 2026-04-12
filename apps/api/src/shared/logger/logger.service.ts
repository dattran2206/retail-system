import { Injectable, LoggerService } from '@nestjs/common';
import { AppLogger } from '@retail-saas/logger';

// ================================================
// AppLoggerService - NestJS wrapper cho AppLogger
// ================================================
// Implements LoggerService để replace NestJS built-in logger

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logger: AppLogger;

  constructor() {
    this.logger = new AppLogger('api', {
      level: (process.env.LOG_LEVEL as 'debug') || 'debug',
      logDir: process.env.LOG_DIR || 'logs',
      isProduction: process.env.NODE_ENV === 'production',
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace ? new Error(trace) : undefined, { context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}

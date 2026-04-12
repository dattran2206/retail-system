import winston from 'winston';

// ================================================
// @retail-saas/logger - Centralized Winston Logger
// ================================================

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: unknown;
}

// Custom log format: JSON với timestamp
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Console format cho development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, tenantId, ...meta }) => {
    const tenant = tenantId ? `[${tenantId}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${tenant} ${message}${metaStr}`;
  }),
);

// Logger factory
export function createLogger(options: {
  service: string;
  level?: LogLevel;
  logDir?: string;
  isProduction?: boolean;
}): winston.Logger {
  const { service, level = 'debug', logDir = 'logs', isProduction = false } = options;

  const transports: winston.transport[] = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      format: isProduction ? logFormat : consoleFormat,
    }),
  );

  // File transports (chỉ khi production hoặc logDir được chỉ định)
  if (isProduction || logDir) {
    transports.push(
      // Error log file
      new winston.transports.File({
        filename: `${logDir}/error.log`,
        level: 'error',
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
      // Combined log file
      new winston.transports.File({
        filename: `${logDir}/combined.log`,
        format: logFormat,
        maxsize: 20 * 1024 * 1024, // 20MB
        maxFiles: 10,
      }),
    );
  }

  return winston.createLogger({
    level,
    defaultMeta: { service },
    transports,
    exceptionHandlers: [
      new winston.transports.File({ filename: `${logDir}/exceptions.log` }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: `${logDir}/rejections.log` }),
    ],
  });
}

// ---- Logger Wrapper Class ----

export class AppLogger {
  private readonly logger: winston.Logger;

  constructor(service: string, options?: Partial<Parameters<typeof createLogger>[0]>) {
    this.logger = createLogger({
      service,
      level: (process.env.LOG_LEVEL as LogLevel) || 'debug',
      logDir: process.env.LOG_DIR || 'logs',
      isProduction: process.env.NODE_ENV === 'production',
      ...options,
    });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.logger.error(message, {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: LogContext): void {
    this.logger.verbose(message, context);
  }

  // Log HTTP request
  logRequest(context: LogContext): void {
    this.logger.info('HTTP Request', context);
  }

  // Log HTTP response
  logResponse(context: LogContext): void {
    this.logger.info('HTTP Response', context);
  }
}

// Singleton instance mặc định
export const logger = new AppLogger('retail-saas');

export default AppLogger;

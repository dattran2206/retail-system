import winston from 'winston';
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
export declare function createLogger(options: {
    service: string;
    level?: LogLevel;
    logDir?: string;
    isProduction?: boolean;
}): winston.Logger;
export declare class AppLogger {
    private readonly logger;
    constructor(service: string, options?: Partial<Parameters<typeof createLogger>[0]>);
    info(message: string, context?: LogContext): void;
    error(message: string, error?: Error | unknown, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    verbose(message: string, context?: LogContext): void;
    logRequest(context: LogContext): void;
    logResponse(context: LogContext): void;
}
export declare const logger: AppLogger;
export default AppLogger;
//# sourceMappingURL=index.d.ts.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.AppLogger = void 0;
exports.createLogger = createLogger;
const winston_1 = __importDefault(require("winston"));
// Custom log format: JSON với timestamp
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Console format cho development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, tenantId, ...meta }) => {
    const tenant = tenantId ? `[${tenantId}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${tenant} ${message}${metaStr}`;
}));
// Logger factory
function createLogger(options) {
    const { service, level = 'debug', logDir = 'logs', isProduction = false } = options;
    const transports = [];
    // Console transport
    transports.push(new winston_1.default.transports.Console({
        format: isProduction ? logFormat : consoleFormat,
    }));
    // File transports (chỉ khi production hoặc logDir được chỉ định)
    if (isProduction || logDir) {
        transports.push(
        // Error log file
        new winston_1.default.transports.File({
            filename: `${logDir}/error.log`,
            level: 'error',
            format: logFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }), 
        // Combined log file
        new winston_1.default.transports.File({
            filename: `${logDir}/combined.log`,
            format: logFormat,
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 10,
        }));
    }
    return winston_1.default.createLogger({
        level,
        defaultMeta: { service },
        transports,
        exceptionHandlers: [
            new winston_1.default.transports.File({ filename: `${logDir}/exceptions.log` }),
        ],
        rejectionHandlers: [
            new winston_1.default.transports.File({ filename: `${logDir}/rejections.log` }),
        ],
    });
}
// ---- Logger Wrapper Class ----
class AppLogger {
    logger;
    constructor(service, options) {
        this.logger = createLogger({
            service,
            level: process.env.LOG_LEVEL || 'debug',
            logDir: process.env.LOG_DIR || 'logs',
            isProduction: process.env.NODE_ENV === 'production',
            ...options,
        });
    }
    info(message, context) {
        this.logger.info(message, context);
    }
    error(message, error, context) {
        this.logger.error(message, {
            ...context,
            error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        });
    }
    warn(message, context) {
        this.logger.warn(message, context);
    }
    debug(message, context) {
        this.logger.debug(message, context);
    }
    verbose(message, context) {
        this.logger.verbose(message, context);
    }
    // Log HTTP request
    logRequest(context) {
        this.logger.info('HTTP Request', context);
    }
    // Log HTTP response
    logResponse(context) {
        this.logger.info('HTTP Response', context);
    }
}
exports.AppLogger = AppLogger;
// Singleton instance mặc định
exports.logger = new AppLogger('retail-saas');
exports.default = AppLogger;
//# sourceMappingURL=index.js.map
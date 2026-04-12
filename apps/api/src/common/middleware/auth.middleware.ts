import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// ================================================
// AuthMiddleware - Basic Auth Token Extraction
// ================================================
// Middleware nhẹ chỉ extract token từ header
// Validation thực sự được handle bởi JwtAuthGuard

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      // Token sẽ được validate bởi PassportJwt strategy
      this.logger.debug('Bearer token present in request');
    }

    next();
  }
}

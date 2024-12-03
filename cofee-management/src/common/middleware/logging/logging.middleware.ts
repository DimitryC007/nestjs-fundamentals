import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(
        `Request to ${req.method} ${req.originalUrl} took ${duration.toFixed(3)} ms`,
      );
    });

    next();
  }
}

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get<string>('redis.host'),
        port: config.get<number>('redis.port'),
        password: config.get<string>('redis.password'),
        db: config.get<number>('redis.db'),
        retryStrategy: (times: number) => {
          if (times > 5) return null; // Dừng retry sau 5 lần
          return Math.min(times * 100, 3000);
        },
      }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}

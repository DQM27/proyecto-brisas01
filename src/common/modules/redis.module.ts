// src/common/modules/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisProvider } from '@common/providers/redis.provider';

@Module({
  providers: [RedisProvider],
  exports: [RedisProvider], // Esto permite que otros módulos lo inyecten
})
export class RedisModule {}

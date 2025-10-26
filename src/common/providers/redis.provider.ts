// src/common/providers/redis.provider.ts
import { createClient, RedisClientType } from 'redis';

export const redisClient: RedisClientType = createClient({
  url: 'redis://localhost:6379', // Ajusta si tu Redis tiene auth o puerto distinto
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect(); // Conecta automáticamente al iniciar la app

import { Provider } from '@nestjs/common';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useValue: redisClient,
};

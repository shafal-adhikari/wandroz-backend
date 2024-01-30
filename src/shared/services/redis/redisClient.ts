import { config } from '@root/config';
import Redis from 'ioredis';

export const redisClient = new Redis({
  host: config.REDIS_HOST,
  maxRetriesPerRequest: null
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

import { config } from '@root/config';
import { createClient } from 'redis';

export const redisClient = createClient({
  url: config.REDIS_HOST
});

export const connectClient = () => {
  redisClient
    .connect()
    .then(() => {
      console.log('Conencted to Redis');
    })
    .catch((err) => {
      console.log(err);
      process.exit(0);
    });
};

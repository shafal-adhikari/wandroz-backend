import { ServerError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { redisClient } from './redisClient';

export const saveUserToCache = async (key: string, userId: string, createdUser: IUserDocument): Promise<void> => {
  const createdAt = new Date();
  let list: string[] = [];
  for (const [key, value] of Object.entries(createdUser)) {
    list.push(`${key}`);
    if (typeof value == 'object') {
      list.push(JSON.stringify(value));
    } else {
      list.push(`${value}`);
    }
  }
  list = [...list, 'createdAt', `${createdAt}`];
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    redisClient.ZADD('user', { score: parseInt(userId, 10), value: `${key}` });
    redisClient.HSET(`users:${key}`, list);
  } catch (error) {
    throw new ServerError();
  }
};

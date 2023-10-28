import { ServerError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { redisClient } from './redisClient';
import { parseJson } from '@global/helpers/helpers';

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

export const getUserFromCache = async (userId: string): Promise<IUserDocument | null> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const response = (await redisClient.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
    response.createdAt = new Date(parseJson(`${response.createdAt}`));
    response.blocked = parseJson(`${response.blocked}`);
    response.blockedBy = parseJson(`${response.blockedBy}`);
    response.notifications = parseJson(`${response.notifications}`);
    response.social = parseJson(`${response.social}`);
    response.followersCount = parseJson(`${response.followersCount}`);
    response.followingCount = parseJson(`${response.followingCount}`);
    response.postsCount = parseJson(`${response.postsCount}`);
    return response;
  } catch (error) {
    throw new ServerError();
  }
};

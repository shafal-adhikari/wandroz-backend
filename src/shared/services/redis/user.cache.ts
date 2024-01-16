import { ServerError } from '@global/helpers/error-handler';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import { redisClient } from './redisClient';
import { parseJson } from '@global/helpers/helpers';

type UserItem = string | ISocialLinks | INotificationSettings;

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

export const updateSingleUserItemInCache = async (userId: string, prop: string, value: UserItem): Promise<IUserDocument | null> => {
  try {
    const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
    await redisClient.HSET(`users:${userId}`, dataToSave);
    const response: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
    return response;
  } catch (error) {
    throw new ServerError();
  }
};

export const getTotalUsersInCache = async (): Promise<number> => {
  try {
    const count: number = await redisClient.ZCARD('user');
    return count;
  } catch (error) {
    throw new ServerError();
  }
};

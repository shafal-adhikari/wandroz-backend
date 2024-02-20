import { ServerError } from '@global/helpers/error-handler';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import { redisClient } from './redisClient';
import { parseJson, shuffle } from '@global/helpers/helpers';

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
    redisClient.zadd('user', parseInt(userId, 10), `${key}`);
    redisClient.hset(`users:${key}`, list);
  } catch (error) {
    throw new ServerError();
  }
};

export const getUserFromCache = async (userId: string): Promise<IUserDocument | null> => {
  try {
    const response = (await redisClient.hgetall(`users:${userId}`)) as unknown as IUserDocument;
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
export const getRandomUsersFromCache = async (userId: string): Promise<IUserDocument[]> => {
  try {
    const replies: IUserDocument[] = [];
    const followers: string[] = await redisClient.lrange(`followers:${userId}`, 0, -1);
    const users: string[] = await redisClient.zrange('user', 0, -1);
    const randomUsers: string[] = shuffle(users).slice(0, 10);
    for (const key of randomUsers) {
      const followerIndex = followers.indexOf(key);
      if (followerIndex < 0) {
        const userHash: IUserDocument = (await redisClient.hgetall(`users:${key}`)) as unknown as IUserDocument;
        replies.push(userHash);
      }
    }
    const excludedIdIndex: number = replies.findIndex((data) => data._id == userId);
    replies.splice(excludedIdIndex, 1);
    for (const reply of replies) {
      reply.createdAt = new Date(parseJson(`${reply.createdAt}`));
      reply.postsCount = parseJson(`${reply.postsCount}`);
      reply.blocked = parseJson(`${reply.blocked}`);
      reply.blockedBy = parseJson(`${reply.blockedBy}`);
      reply.notifications = parseJson(`${reply.notifications}`);
      reply.social = parseJson(`${reply.social}`);
      reply.followersCount = parseJson(`${reply.followersCount}`);
      reply.followingCount = parseJson(`${reply.followingCount}`);
      reply.bgImageId = parseJson(`${reply.bgImageId}`);
      reply.bgImageVersion = parseJson(`${reply.bgImageVersion}`);
      reply.profilePicture = parseJson(`${reply.profilePicture}`);
      reply.work = parseJson(`${reply.work}`);
      reply.school = parseJson(`${reply.school}`);
      reply.location = parseJson(`${reply.location}`);
      reply.quote = parseJson(`${reply.quote}`);
    }
    return replies;
  } catch (error) {
    throw new ServerError();
  }
};
export const updateSingleUserItemInCache = async (userId: string, prop: string, value: UserItem): Promise<IUserDocument | null> => {
  try {
    const dataToSave: string[] = [`${prop}`, JSON.stringify(value)];
    await redisClient.hset(`users:${userId}`, dataToSave);
    const response: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
    return response;
  } catch (error) {
    throw new ServerError();
  }
};

export const getTotalUsersInCache = async (): Promise<number> => {
  try {
    const count: number = await redisClient.zcard('user');
    return count;
  } catch (error) {
    throw new ServerError();
  }
};

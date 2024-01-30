import { remove } from 'lodash';
import mongoose from 'mongoose';
import { ServerError } from '@global/helpers/error-handler';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { getUserFromCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { redisClient } from './redisClient';
import { parseJson } from '@global/helpers/helpers';

export const saveFollowerToCache = async (key: string, value: string): Promise<void> => {
  try {
    await redisClient.lpush(key, value);
  } catch (error) {
    throw new ServerError();
  }
};

export const removeFollowerFromCache = async (key: string, value: string): Promise<void> => {
  try {
    await redisClient.lrem(key, 1, value);
  } catch (error) {
    throw new ServerError();
  }
};

export const updateFollowersCountInCache = async (userId: string, prop: string, value: number): Promise<void> => {
  try {
    await redisClient.hincrby(`users:${userId}`, prop, value);
  } catch (error) {
    throw new ServerError();
  }
};

export const getFollowersFromCache = async (key: string): Promise<IFollowerData[]> => {
  try {
    const response: string[] = await redisClient.lrange(key, 0, -1);
    const list: IFollowerData[] = [];
    for (const item of response) {
      const user: IUserDocument = (await getUserFromCache(item)) as IUserDocument;
      const data: IFollowerData = {
        _id: new mongoose.Types.ObjectId(user._id),
        username: user.username!,
        postCount: user.postsCount,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        profilePicture: user.profilePicture,
        uId: user.uId!,
        userProfile: user
      };
      list.push(data);
    }
    return list;
  } catch (error) {
    throw new ServerError();
  }
};

export const updateBlockedUserPropInCache = async (key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> => {
  try {
    const response: string = (await redisClient.hget(`users:${key}`, prop)) as string;
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    let blocked: string[] = parseJson(response) as string[];
    if (type === 'block') {
      blocked = [...blocked, value];
    } else {
      remove(blocked, (id: string) => id === value);
      blocked = [...blocked];
    }
    const dataToSave: string[] = [`${prop}`, JSON.stringify(blocked)];
    multi.hset(`users:${key}`, dataToSave);
    await multi.exec();
  } catch (error) {
    throw new ServerError();
  }
};

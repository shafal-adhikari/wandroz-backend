import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { addFollowerJob } from '@service/queues/follower-queue';
import { getUserFromCache } from '@service/redis/user.cache';
import { saveFollowerToCache, updateFollowersCountInCache } from '@service/redis/follower.cache';

export const updateFollower = async (req: Request, res: Response): Promise<void> => {
  const { followerId } = req.params;
  // update count in cache
  const followersCount: Promise<void> = updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
  const followeeCount: Promise<void> = updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
  await Promise.all([followersCount, followeeCount]);

  const cachedFollower: Promise<IUserDocument> = getUserFromCache(followerId) as Promise<IUserDocument>;
  const cachedFollowee: Promise<IUserDocument> = getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;
  await Promise.all([cachedFollower, cachedFollowee]);

  const followerObjectId: ObjectId = new ObjectId();

  const addFollowerToCache: Promise<void> = saveFollowerToCache(`following:${req.currentUser!.userId}`, `${followerId}`);
  const addFolloweeToCache: Promise<void> = saveFollowerToCache(`followers:${followerId}`, `${req.currentUser!.userId}`);
  await Promise.all([addFollowerToCache, addFolloweeToCache]);

  addFollowerJob('addFollowerToDB', {
    keyOne: `${req.currentUser!.userId}`,
    keyTwo: `${followerId}`,
    username: req.currentUser!.username,
    followerDocumentId: followerObjectId
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
};

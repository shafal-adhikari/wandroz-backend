import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { removeFollowerFromCache, updateFollowersCountInCache } from '@service/redis/follower.cache';
import { addFollowerJob } from '@service/queues/follower-queue';

export const removeFollower = async (req: Request, res: Response): Promise<void> => {
  const { followeeId, followerId } = req.params;
  const removeFollowerFromCacheData: Promise<void> = removeFollowerFromCache(`following:${req.currentUser!.userId}`, followeeId);
  const removeFolloweeFromCacheData: Promise<void> = removeFollowerFromCache(`followers:${followeeId}`, followerId);

  const followersCount: Promise<void> = updateFollowersCountInCache(`${followeeId}`, 'followersCount', -1);
  const followeeCount: Promise<void> = updateFollowersCountInCache(`${followerId}`, 'followingCount', -1);
  await Promise.all([removeFollowerFromCacheData, removeFolloweeFromCacheData, followersCount, followeeCount]);

  addFollowerJob('removeFollowerFromDB', {
    keyOne: `${followeeId}`,
    keyTwo: `${followerId}`
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
};

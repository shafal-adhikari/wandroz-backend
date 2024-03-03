import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { AccountPrivacy } from '@user/interfaces/user.interface';
import { addFollowerJob } from '@service/queues/follower-queue';
import { saveFollowerToCache, updateFollowersCountInCache } from '@service/redis/follower.cache';
import { getUserById } from '@service/db/user.service';
import { FollowerStatus } from '@follower/interfaces/follower.interface';

export const followUser = async (req: Request, res: Response): Promise<void> => {
  const { followeeId } = req.params;
  const followerObjectId: ObjectId = new ObjectId();
  const user = await getUserById(followeeId);
  if (user.privacy == AccountPrivacy.PRIVATE) {
    addFollowerJob('addFollowerToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followeeId}`,
      username: `${user.firstName} ${user.lastName}`,
      followerDocumentId: followerObjectId,
      status: FollowerStatus.PENDING
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Follow request sent' });
    return;
  }
  const followersCount: Promise<void> = updateFollowersCountInCache(`${followeeId}`, 'followersCount', 1);
  const followeeCount: Promise<void> = updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
  await Promise.all([followersCount, followeeCount]);

  const addFollowerToCache: Promise<void> = saveFollowerToCache(`following:${req.currentUser!.userId}`, `${followeeId}`);
  const addFolloweeToCache: Promise<void> = saveFollowerToCache(`followers:${followeeId}`, `${req.currentUser!.userId}`);
  await Promise.all([addFollowerToCache, addFolloweeToCache]);

  addFollowerJob('addFollowerToDB', {
    keyOne: `${req.currentUser!.userId}`,
    keyTwo: `${followeeId}`,
    username: `${user.firstName} ${user.lastName}`,
    followerDocumentId: followerObjectId,
    status: FollowerStatus.COMPLETE
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
};

import { Request, Response } from 'express';
import { addFollowerJob } from '@service/queues/follower-queue';
import { saveFollowerToCache, updateFollowersCountInCache } from '@service/redis/follower.cache';
import { FollowerModel } from '@follower/models/follower.schema';
import mongoose from 'mongoose';
import { BadRequestError } from '@global/helpers/error-handler';

export const acceptFollowStatus = async (req: Request, res: Response): Promise<void> => {
  const { status, followerId } = req.body;
  const followerIdObject = new mongoose.Types.ObjectId(followerId);
  const followeeObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);
  const followRequest = await FollowerModel.findOne({ followerId: followerIdObject, followeeId: followeeObjectId });
  if (!followRequest) {
    throw new BadRequestError('Follow request not found');
  }
  if (status == false) {
    addFollowerJob('updateFollowerStatus', { keyOne: followerId, keyTwo: req.currentUser!.userId, acceptStatus: status });
    res.json({ message: 'Declined follow request' });
    return;
  }
  const followersCount: Promise<void> = updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
  const followeeCount: Promise<void> = updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
  await Promise.all([followersCount, followeeCount]);

  const addFollowerToCache: Promise<void> = saveFollowerToCache(`following:${req.currentUser!.userId}`, `${followerId}`);
  const addFolloweeToCache: Promise<void> = saveFollowerToCache(`followers:${followerId}`, `${req.currentUser!.userId}`);
  await Promise.all([addFollowerToCache, addFolloweeToCache]);

  addFollowerJob('updateFollowerStatus', { keyOne: followerId, keyTwo: req.currentUser?.userId, acceptStatus: status });
  res.json({ message: 'User is now following you' });
};

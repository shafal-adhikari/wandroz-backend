import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import * as followerService from '@service/db/follower.service';
import { getFollowersFromCache } from '@service/redis/follower.cache';

export const getUserFollowing = async (req: Request, res: Response): Promise<void> => {
  const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
  const cachedFollowees: IFollowerData[] = await getFollowersFromCache(`following:${req.currentUser!.userId}`);
  const following: IFollowerData[] = cachedFollowees.length ? cachedFollowees : await followerService.getFolloweeData(userObjectId);
  res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
};

export const getUserFollowers = async (req: Request, res: Response): Promise<void> => {
  const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
  const cachedFollowers: IFollowerData[] = await getFollowersFromCache(`followers:${req.params.userId}`);
  const followers: IFollowerData[] = cachedFollowers.length ? cachedFollowers : await followerService.getFollowerData(userObjectId);
  res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
};

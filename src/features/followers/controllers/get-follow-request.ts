import { getFolloweeData, getFollowerData } from '@service/db/follower.service';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FollowerStatus } from '@follower/interfaces/follower.interface';

export const getFolloweeRequests = async (req: Request, res: Response): Promise<void> => {
  const userObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);
  const followRequests = await getFolloweeData(userObjectId, FollowerStatus.PENDING);
  res.json({ message: 'Sent Follow Requests', followRequests });
};

export const getFollowerRequests = async (req: Request, res: Response): Promise<void> => {
  const userObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);
  const followRequests = await getFollowerData(userObjectId, FollowerStatus.PENDING);
  res.json({ message: 'New Follow Requests', followRequests });
};

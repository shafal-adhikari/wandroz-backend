import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { addBlockedUserJob } from '@service/queues/blocked.queue';
import { updateBlockedUserPropInCache } from '@service/redis/follower.cache';

export const block = async (req: Request, res: Response): Promise<void> => {
  const { followerId } = req.params;
  updateBlockedUser(followerId, req.currentUser!.userId, 'block');
  addBlockedUserJob('addBlockedUserToDB', {
    keyOne: `${req.currentUser!.userId}`,
    keyTwo: `${followerId}`,
    type: 'block'
  });
  res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
};

export const unblock = async (req: Request, res: Response): Promise<void> => {
  const { followerId } = req.params;
  updateBlockedUser(followerId, req.currentUser!.userId, 'unblock');
  addBlockedUserJob('addUnblockedUserToDB', {
    keyOne: `${req.currentUser!.userId}`,
    keyTwo: `${followerId}`,
    type: 'unblock'
  });
  res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
};

const updateBlockedUser = async (followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> => {
  const blocked: Promise<void> = updateBlockedUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
  const blockedBy: Promise<void> = updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
  await Promise.all([blocked, blockedBy]);
};

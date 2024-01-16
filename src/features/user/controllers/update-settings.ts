import HTTP_STATUS from 'http-status-codes';
import { addUserJob } from '@service/queues/user.queue';
import { updateSingleUserItemInCache } from '@service/redis/user.cache';
import { Request, Response } from 'express-serve-static-core';

export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  await updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
  addUserJob('updateNotificationSettings', {
    key: `${req.currentUser!.userId}`,
    value: req.body
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
};

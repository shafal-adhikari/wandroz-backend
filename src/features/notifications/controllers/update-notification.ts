import { addNotificationJob } from '@service/queues/notification.queue';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export const updateNotification = async (req: Request, res: Response): Promise<void> => {
  const { notificationId } = req.params;
  addNotificationJob('updateNotification', { key: notificationId });
  res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
};

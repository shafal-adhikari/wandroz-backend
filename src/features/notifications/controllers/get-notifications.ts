import { INotificationDocument } from '@notification/interfaces/notification.interface';
import * as notificationService from '@service/db/notification.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const notifications: INotificationDocument[] = await notificationService.getNotifications(req.currentUser!.userId);
  res.status(HTTP_STATUS.OK).json({ message: 'User notifications', notifications });
};

import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import mongoose from 'mongoose';

export const getNotificationsFromDb = async (userId: string): Promise<INotificationDocument[]> => {
  const notifications: INotificationDocument[] = await NotificationModel.aggregate([
    { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        _id: 1,
        message: 1,
        comment: 1,
        createdAt: 1,
        createdItemId: 1,
        entityId: 1,
        notificationType: 1,
        gifUrl: 1,
        post: 1,
        reaction: 1,
        read: 1
      }
    }
  ]);
  return notifications;
};

export const updateNotification = async (notificationId: string): Promise<void> => {
  await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } }).exec();
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await NotificationModel.deleteOne({ _id: notificationId }).exec();
};

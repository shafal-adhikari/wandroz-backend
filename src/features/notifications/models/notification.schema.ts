import { INotificationDocument, INotification } from '@notification/interfaces/notification.interface';
import * as notificationService from '@service/db/notification.service';
import mongoose, { model, Model, Schema } from 'mongoose';

const notificationSchema: Schema = new Schema({
  userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: String,
  entityId: mongoose.Types.ObjectId,
  createdItemId: mongoose.Types.ObjectId,
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
  const { userTo, userFrom, message, notificationType, entityId, createdItemId, createdAt, comment, reaction, post } = body;

  await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    createdAt,
    comment,
    reaction,
    post
  });
  try {
    const notifications: INotificationDocument[] = await notificationService.getNotificationsFromDb(userTo);
    return notifications;
  } catch (error) {
    return error;
  }
};

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema, 'Notification');
export { NotificationModel };

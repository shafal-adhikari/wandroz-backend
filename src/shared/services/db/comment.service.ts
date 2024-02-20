import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import mongoose, { Query } from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { notificationMessageTemplate } from '@service/emails/templates/notifications/notification-template';
import { getUserFromCache } from '@service/redis/user.cache';
import { addEmailJob } from '@service/queues/email.queue';

export const addCommentToDB = async (commentData: ICommentJob): Promise<void> => {
  const { postId, userTo, userFrom, comment, username } = commentData;
  const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
  const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
    { _id: postId },
    { $inc: { commentsCount: 1 } },
    { new: true }
  ) as Query<IPostDocument, IPostDocument>;
  const user: Promise<IUserDocument> = getUserFromCache(userTo) as Promise<IUserDocument>;
  const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);

  if (response[2].notifications.comments && userFrom !== userTo) {
    const notificationModel: INotificationDocument = new NotificationModel();
    await notificationModel.insertNotification({
      userFrom,
      userTo,
      message: `${username} commented on your post.`,
      notificationType: 'comment',
      entityId: new mongoose.Types.ObjectId(postId),
      createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
      createdAt: new Date(),
      comment: comment.comment,
      post: response[1].post,
      imgId: response[1].images?.[0].imgId,
      imgVersion: response[1].images?.[0].imgVersion,
      gifUrl: response[1].gifUrl!,
      reaction: ''
    });
    const templateParams: INotificationTemplate = {
      username: response[2].username!,
      message: `${username} commented on your post.`,
      header: 'Comment Notification'
    };
    const template: string = notificationMessageTemplate(templateParams);
    addEmailJob('commentsEmail', { receiverEmail: response[2].email!, template, subject: 'Post notification' });
  }
};

export const getPostComments = async (query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> => {
  const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
  return comments;
};

export const getPostCommentNames = async (query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> => {
  const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
    { $match: query },
    { $sort: sort },
    { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
    { $project: { _id: 0 } }
  ]);
  return commentsNamesList;
};

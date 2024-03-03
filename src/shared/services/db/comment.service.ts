import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import mongoose, { Query } from 'mongoose';
import { NotificationModel } from '@notification/models/notification.schema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { notificationMessageTemplate } from '@service/emails/templates/notifications/notification-template';
import { addEmailJob } from '@service/queues/email.queue';
import { UserModel } from '@user/models/user.schema';

export const addCommentToDB = async (commentData: ICommentJob): Promise<void> => {
  try {
    const { postId, userFrom, comment } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const response: [ICommentDocument, IPostDocument] = await Promise.all([comments, post]);
    const userTo = await UserModel.findOne({ _id: response[1].userId });
    const user = await UserModel.findOne({ _id: userFrom });
    if (user && userTo && userTo.notifications.comments && userFrom !== userTo._id.toString()) {
      const notificationModel: INotificationDocument = new NotificationModel();
      await notificationModel.insertNotification({
        userFrom,
        userTo: userTo._id.toString(),
        message: `${user?.firstName} ${user.lastName} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        reaction: ''
      });
      const templateParams: INotificationTemplate = {
        message: `${user.firstName} ${user.lastName} commented on your post.`,
        header: 'Comment Notification',
        firstName: `${user.firstName}`,
        lastName: `${user.lastName}`
      };
      const template: string = notificationMessageTemplate(templateParams);
      addEmailJob('commentsEmail', { receiverEmail: userTo.email!, template, subject: 'Post notification' });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getPostComments = async (query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> => {
  const comments: ICommentDocument[] = await CommentsModel.aggregate([
    { $match: query },
    { $sort: sort },
    {
      $lookup: {
        from: 'User',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $addFields: {
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        profilePicture: '$user.profilePicture'
      }
    },
    {
      $unset: 'user'
    }
  ]);
  return comments;
};

export const getPostCommentNames = async (query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> => {
  const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
    { $match: query },
    { $sort: sort },
    {
      $lookup: {
        from: 'User',
        foreignField: '_id',
        localField: 'userId',
        as: '$user'
      }
    },
    {
      $unwind: '$user'
    },
    { $group: { _id: null, names: { $addToSet: '$user.firstName $user.lastName' }, count: { $sum: 1 } } },
    { $project: { _id: 0 } }
  ]);
  return commentsNamesList;
};

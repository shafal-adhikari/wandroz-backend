import { FollowerModel } from '@follower/models/follower.schema';
import { UserModel } from '@user/models/user.schema';
import { ObjectId, BulkWriteResult } from 'mongodb';
import mongoose, { Query } from 'mongoose';
import { FollowerStatus, IFollowerData, IFollowerDocument } from '@follower/interfaces/follower.interface';
import { IQueryDeleted, IQueryComplete } from '@post/interfaces/post.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { addEmailJob } from '@service/queues/email.queue';
import { map } from 'lodash';
import { getUserFromCache } from '@service/redis/user.cache';
import { notificationMessageTemplate } from '@service/emails/templates/notifications/notification-template';

export const addFollowerToDB = async (
  userId: string,
  followeeId: string,
  username: string,
  followerDocumentId: ObjectId,
  status: FollowerStatus
): Promise<void> => {
  const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
  const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

  const following = await FollowerModel.create({
    _id: followerDocumentId,
    followeeId: followeeObjectId,
    followerId: followerObjectId,
    status: status
  });
  let response: [BulkWriteResult | null, IUserDocument | null];
  if (status == FollowerStatus.COMPLETE) {
    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);
    response = await Promise.all([users, getUserFromCache(followeeId)]);
  } else {
    response = [null, await getUserFromCache(followeeId)];
  }

  if (response[1]?.notifications.follows && userId !== followeeId) {
    const notificationModel: INotificationDocument = new NotificationModel();
    await notificationModel.insertNotification({
      userFrom: userId,
      userTo: followeeId,
      message: status == FollowerStatus.COMPLETE ? `${username} is now following you.` : `${username} sent a follow request`,
      notificationType: 'follows',
      entityId: new mongoose.Types.ObjectId(userId),
      createdItemId: new mongoose.Types.ObjectId(following._id),
      createdAt: new Date(),
      comment: '',
      post: '',
      reaction: ''
    });
    const templateParams: INotificationTemplate = {
      message: `${username} is now following you.`,
      header: 'Follower Notification'
    };
    const template: string = notificationMessageTemplate(templateParams);
    addEmailJob('followersEmail', {
      receiverEmail: response[1].email!,
      template,
      subject: status == FollowerStatus.COMPLETE ? `${username} is now following you.` : `${username} has sent a follow request`
    });
  }
};
export const updateFollowerStatusToDB = async (followerId: string, followeeId: string, status: boolean): Promise<void> => {
  console.log(followerId, followeeId);
  if (status == false) {
    await FollowerModel.deleteOne({ followerId, followeeId });
    return;
  } else {
    const follow = await FollowerModel.findOneAndUpdate({ followerId, followeeId }, { status: FollowerStatus.COMPLETE });
    if (!follow) return;
    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: follow?.followerId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: follow?.followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      }
    ]);
    const response = await Promise.all([users, getUserFromCache(follow.followerId.toString())]);

    if (response[1]?.notifications.follows) {
      const notificationModel: INotificationDocument = new NotificationModel();
      await notificationModel.insertNotification({
        userFrom: follow.followeeId.toString(),
        userTo: follow.followerId.toString(),
        message: `${response[1].firstName} ${response[1].lastName} accepted your follow request`,
        notificationType: 'follows',
        entityId: follow.followeeId,
        createdItemId: new mongoose.Types.ObjectId(follow._id),
        createdAt: new Date(),
        comment: '',
        post: '',
        reaction: ''
      });
      const templateParams: INotificationTemplate = {
        message: `${response[1].firstName} ${response[1].lastName} accepted your follow request`,
        header: 'Follower Notification'
      };
      const template: string = notificationMessageTemplate(templateParams);
      addEmailJob('followersEmail', {
        receiverEmail: response[1].email!,
        template,
        subject: `${response[1].firstName} ${response[1].lastName} accepted your follow request`
      });
    }
  }
};
export const removeFollowerFromDB = async (followeeId: string, followerId: string): Promise<void> => {
  const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
  const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);
  console.log(followeeObjectId, followerObjectId);

  const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
    followeeId: followeeObjectId,
    followerId: followerObjectId
  });

  const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
    {
      updateOne: {
        filter: { _id: followerId },
        update: { $inc: { followingCount: -1 } }
      }
    },
    {
      updateOne: {
        filter: { _id: followeeId },
        update: { $inc: { followersCount: -1 } }
      }
    }
  ]);

  await Promise.all([unfollow, users]);
};
export const getFolloweeData = async (
  userObjectId: ObjectId,
  status: FollowerStatus = FollowerStatus.COMPLETE
): Promise<IFollowerData[]> => {
  const followee: IFollowerData[] = await FollowerModel.aggregate([
    { $match: { followerId: userObjectId, status } },
    { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
    { $unwind: '$followeeId' },
    {
      $project: {
        _id: '$followeeId._id',
        firstName: '$followeeId.firstName',
        lastName: '$followeeId.lastName',
        profilePicture: '$followeeId.profilePicture'
      }
    }
  ]);
  return followee;
};

export const getFollowerData = async (
  userObjectId: ObjectId,
  status: FollowerStatus = FollowerStatus.COMPLETE
): Promise<IFollowerData[]> => {
  const follower: IFollowerData[] = await FollowerModel.aggregate([
    { $match: { followeeId: userObjectId, status } },
    { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
    { $unwind: '$followerId' },
    {
      $project: {
        _id: '$followerId._id',
        firstName: '$followerId.firstName',
        lastName: '$followerId.lastName',
        profilePicture: '$followerId.profilePicture'
      }
    }
  ]);
  return follower;
};

export const getFolloweesIds = async (userId: string): Promise<string[]> => {
  const followee = await FollowerModel.aggregate([
    { $match: { followerId: new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        followeeId: 1,
        _id: 0
      }
    }
  ]);
  return map(followee, (result) => result.followeeId.toString());
};

export const getPendingFolloweesId = async (userId: string): Promise<string[]> => {
  const followee = await FollowerModel.aggregate([
    { $match: { followerId: new mongoose.Types.ObjectId(userId), status: FollowerStatus.PENDING } },
    {
      $project: {
        followeeId: 1,
        _id: 0
      }
    }
  ]);
  return map(followee, (result) => result.followeeId.toString());
};

import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IQueryReaction, IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ReactionModel } from '@reactions/models/reaction.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.schema';
import { getUserFromCache } from '@service/redis/user.cache';

export async function addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
  try {
    const { postId, userFrom, type, previousReaction, reactionObject } = reactionData;
    console.log(reactionData);
    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    if (previousReaction && previousReaction.length) {
      updatedReactionObject = omit(reactionObject, ['_id']);
    }
    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      {
        $inc: {
          [`reactions.${previousReaction}`]: -1,
          [`reactions.${type}`]: 1
        }
      },
      { new: true }
    );
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      getUserFromCache(`${post?.userId}`),
      ReactionModel.replaceOne(
        { postId, type: previousReaction, userId: new mongoose.Types.ObjectId(reactionObject?.userId) },
        updatedReactionObject,
        { upsert: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];
    if (post && updatedReaction[0].notifications.reactions && post.userId !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      await notificationModel.insertNotification({
        userFrom: userFrom as string,
        userTo: updatedReaction[0]._id as string,
        message: `${updatedReaction[0].firstName} ${updatedReaction[0].lastName} reacted to your post.`,
        notificationType: 'reactions',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(updatedReaction[1]._id!),
        createdAt: new Date(),
        comment: '',
        post: post.post,
        imgId: post.images?.[0].imgId,
        imgVersion: post.images?.[0].imgVersion,
        gifUrl: post.gifUrl!,
        reaction: type!
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
  const { postId, previousReaction, userFrom } = reactionData;
  await Promise.all([
    ReactionModel.deleteOne({ postId, type: previousReaction, userId: new mongoose.Types.ObjectId(userFrom) }),
    PostModel.updateOne(
      { _id: postId },
      {
        $inc: {
          [`reactions.${previousReaction}`]: -1
        }
      },
      { new: true }
    )
  ]);
}

export async function getPostReactions(query: IQueryReaction, sort: Record<string, 1 | -1>): Promise<[IReactionDocument[], number]> {
  const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
  return [reactions, reactions.length];
}

export async function getSinglePostReactionByUserId(postId: string, userId: string): Promise<[IReactionDocument, number] | []> {
  const reactions: IReactionDocument[] = await ReactionModel.aggregate([
    { $match: { postId: new mongoose.Types.ObjectId(postId), userId: new mongoose.Types.ObjectId(userId) } }
  ]);
  return reactions.length ? [reactions[0], 1] : [];
}

export async function getReactionsByUserId(userId: string): Promise<IReactionDocument[]> {
  const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }]);
  return reactions;
}

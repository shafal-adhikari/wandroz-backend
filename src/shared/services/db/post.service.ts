import { ImageModel } from '@image/models/image.schema';
import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import mongoose, { Query, UpdateQuery } from 'mongoose';

export const addPostToDb = async (userId: string, createdPost: IPostDocument): Promise<void> => {
  const post: Promise<IPostDocument> = PostModel.create(createdPost);
  const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
  await Promise.all([post, user]);
};

export const getPosts = async (query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> => {
  let postQuery = {};
  if (query?.images && query?.gifUrl) {
    postQuery = { $or: [{ images: { $exists: true, $ne: [] } }, { gifUrl: { $ne: '' } }] };
  } else if (query?.videos) {
    postQuery = { $or: [{ videos: { $exists: true, $ne: [] } }] };
  } else {
    postQuery = query;
  }
  const posts: IPostDocument[] = await PostModel.aggregate([
    { $match: postQuery },
    {
      $lookup: {
        from: 'User',
        foreignField: '_id',
        localField: 'userId',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'Reaction',
        foreignField: 'postId',
        localField: '_id',
        as: 'allReactions'
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
      $unset: ['user']
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit }
  ]);
  return posts;
};
export const getPost = async (postId: string) => {
  const posts = await PostModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId)
      }
    },
    {
      $lookup: {
        from: 'User',
        foreignField: '_id',
        localField: 'userId',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'Reaction',
        foreignField: 'postId',
        localField: '_id',
        as: 'allReactions'
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
      $unset: ['user']
    }
  ]);
  return posts[0] as IPostDocument;
};
export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const post = await PostModel.findById(postId);
  if (post?.images?.length) {
    await ImageModel.deleteMany({ _id: { $in: post.images } });
  }
  if (post?.videos?.length) {
    await ImageModel.deleteMany({ _id: { $in: post.images } });
  }
  const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
  // delete reactions here
  const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
  await Promise.all([deletePost, decrementPostCount]);
};

export const editPost = async (postId: string, updatedPost: IPostDocument): Promise<void> => {
  const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  await Promise.all([updatePost]);
};
export const getPostsCount = async (): Promise<number> => {
  const count: number = await PostModel.find({}).countDocuments();
  return count;
};

import { IGetPostsQuery, IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';

export const addPostToDb = async (userId: string, createdPost: IPostDocument): Promise<void> => {
  const post: Promise<IPostDocument> = PostModel.create(createdPost);
  const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
  await Promise.all([post, user]);
};

export const getPosts = async (query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> => {
  let postQuery = {};
  if (query?.imgId && query?.gifUrl) {
    postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
  } else if (query?.videoId) {
    postQuery = { $or: [{ videoId: { $ne: '' } }] };
  } else {
    postQuery = query;
  }
  const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);
  return posts;
};

export const getPostsCount = async (): Promise<number> => {
  const count: number = await PostModel.find({}).countDocuments();
  return count;
};

export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
  // delete reactions here
  const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
  await Promise.all([deletePost, decrementPostCount]);
};

export const editPost = async (postId: string, updatedPost: IPostDocument): Promise<void> => {
  const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  await Promise.all([updatePost]);
};

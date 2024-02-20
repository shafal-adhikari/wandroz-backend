import { IReactions } from '@reactions/interfaces/reaction.interface';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export interface IPostImages {
  imgVersion: string;
  imgId: string;
}
export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  username?: string;
  profilePicture?: string;
  images?: IPostImages[];
  videos?: IPostImages[];
  videoId?: string;
  videoVersion?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  images?: string;
  gifUrl?: string;
  userId?: string;
  videos?: string;
}

export interface ISavePostToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdPost: IPostDocument;
}

export interface IPostJobData {
  key?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}

import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface IReactionDocument extends Document {
  _id?: string | ObjectId;
  type: string;
  postId: string;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  userId: string;
  createdAt?: Date;
  comment?: string;
}

export interface IReactions {
  like: number;
  love: number;
  happy: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface IReactionJob {
  postId: string;
  previousReaction: string;
  userTo?: string;
  userFrom?: string;
  type?: string;
  reactionObject?: IReactionDocument;
}

export interface IQueryReaction {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}

export interface IReaction {
  senderName: string;
  type: string;
}

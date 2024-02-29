import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export interface ICommentDocument extends Document {
  _id?: string | ObjectId;
  postId: string;
  comment: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  createdAt?: Date;
  userId: ObjectId | string;
}

export interface ICommentJob {
  postId: string;
  userFrom: string;
  comment: ICommentDocument;
}

export interface ICommentNameList {
  count: number;
  names: string[];
}

export interface IQueryComment {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}

export interface IQuerySort {
  createdAt?: number;
}

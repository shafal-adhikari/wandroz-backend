import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  uId: string;
  email: string;
  iat?: number;
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  email: string;
  password?: string;
  createdAt: Date;
  verifyToken?: string;
  verifyTokenExpires?: number;
  isVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verifyToken?: string;
  verifyTokenExpires?: number;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}

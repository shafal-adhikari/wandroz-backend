import mongoose, { Document } from 'mongoose';

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  body: string;
  isRead: boolean;
  selectedImage: string;
  createdAt: Date;
}

export interface IMessageData {
  _id: string | mongoose.Types.ObjectId;
  receiverId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: Date | string;
}

export interface ITyping {
  sender: string;
  receiver: string;
  typing: boolean;
}

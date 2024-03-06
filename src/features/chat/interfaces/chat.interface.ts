import mongoose, { Document } from 'mongoose';
import { AuthPayload } from '@auth/interfaces/auth.interface';

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

export interface IMessageNotification {
  currentUser: AuthPayload;
  message: string;
  receiverName: string;
  receiverId: string;
  messageData: IMessageData;
}

export interface IChatList {
  receiverId: string;
  conversationId: string;
}

export interface ITyping {
  sender: string;
  receiver: string;
}

export interface ISenderReceiver {
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
}

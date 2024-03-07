import { IMessageData } from '@chat/interfaces/chat.interface';
import { MessageModel } from '@chat/model/chat.schema';
import { ServerError } from '@global/helpers/error-handler';
import mongoose from 'mongoose';

export const addChatMessage = async (chat: IMessageData) => {
  try {
    const chatDoc = await MessageModel.create({
      _id: new mongoose.Types.ObjectId(chat._id),
      senderId: new mongoose.Types.ObjectId(chat.senderId),
      receiverId: new mongoose.Types.ObjectId(chat.receiverId),
      body: chat.body,
      isRead: chat.isRead,
      createdAt: chat.createdAt
    });
    chatDoc.save();
  } catch (error) {
    throw new ServerError();
  }
};

export const getChatMessages = async (senderId: mongoose.Types.ObjectId, receiverId: mongoose.Types.ObjectId) => {
  try {
    const chatMessages = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: senderId, receiverId: receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        }
      },
      { $sort: { createdAt: 1 } }
    ]);
    return chatMessages;
  } catch (error) {
    throw new ServerError();
  }
};

export const messageSeen = async (senderId: mongoose.Types.ObjectId, receiverId: mongoose.Types.ObjectId) => {
  await MessageModel.aggregate([
    {
      $match: {
        senderId: senderId,
        recieverId: receiverId,
        isRead: false
      }
    },
    {
      $set: {
        isRead: true
      }
    }
  ]);
};

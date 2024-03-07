import { MessageModel } from '@chat/model/chat.schema';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const getChatList = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.currentUser!.userId);
  const chatList = await MessageModel.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }]
      }
    },
    {
      $group: {
        _id: { $cond: [{ $eq: ['$receiverId', userId] }, '$senderId', '$receiverId'] },
        latestMessage: { $last: '$body' },
        latestMessageTime: { $last: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'User',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $lookup: {
        from: 'MessageModel',
        pipeline: [
          {
            $match: {
              receiverId: userId,
              senderId: '$_id',
              isRead: false
            }
          },
          {
            $project: {
              _id: 1
            }
          }
        ],
        as: 'readMessages'
      }
    },
    {
      $project: {
        _id: 1,
        latestMessage: 1,
        latestMessageTime: 1,
        firstName: '$userDetails.firstName',
        lastName: '$userDetails.lastName',
        profilePicture: '$userDetails.profilePicture',
        isRead: { $gt: [{ $size: '$readMessages' }, 0] }
      }
    }
  ]);
  return res.json({ message: 'Get Conversation List', chatList });
};

import mongoose from 'mongoose';
import { PushOperator } from 'mongodb';
import { UserModel } from '@user/models/user.schema';

export const blockUser = async (userId: mongoose.Types.ObjectId, followerId: mongoose.Types.ObjectId): Promise<void> => {
  UserModel.bulkWrite([
    {
      updateOne: {
        filter: { _id: userId, blocked: { $ne: followerId } },
        update: {
          $push: {
            blocked: followerId
          } as PushOperator<Document>
        }
      }
    },
    {
      updateOne: {
        filter: { _id: followerId, blockedBy: { $ne: userId } },
        update: {
          $push: {
            blockedBy: userId
          } as PushOperator<Document>
        }
      }
    }
  ]);
};

export const unblockUser = async (userId: mongoose.Types.ObjectId, followerId: mongoose.Types.ObjectId): Promise<void> => {
  UserModel.bulkWrite([
    {
      updateOne: {
        filter: { _id: userId },
        update: {
          $pull: {
            blocked: followerId
          } as PushOperator<Document>
        }
      }
    },
    {
      updateOne: {
        filter: { _id: followerId },
        update: {
          $pull: {
            blockedBy: new mongoose.Types.ObjectId(userId)
          } as PushOperator<Document>
        }
      }
    }
  ]);
};

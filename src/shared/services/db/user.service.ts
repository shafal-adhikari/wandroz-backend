import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

export const addUserData = async (data: IUserDocument) => {
  await UserModel.create(data);
};

export const getUserByAuthId = async (authId: string) => {
  const users: IUserDocument[] = await UserModel.aggregate([
    {
      $match: { authId: new mongoose.Types.ObjectId(authId) }
    },
    {
      $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' }
    },
    { $unwind: '$authId' },
    { $project: aggregateProject() }
  ]);
  return users[0];
};

export const getUserById = async (userId: string) => {
  const users: IUserDocument[] = await UserModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' }
    },
    { $unwind: '$authId' },
    { $project: aggregateProject() }
  ]);
  return users[0];
};

const aggregateProject = () => {
  return {
    _id: 1,
    username: '$authId.username',
    email: '$authId.email',
    uId: '$authId.uId',
    avatarColor: '$authId.avatarColor',
    createdAt: '$authId.createdAt',
    quote: 1,
    postsCount: 1,
    location: 1,
    blocked: 1,
    blockedBy: 1,
    followersCount: 1,
    followingCount: 1,
    notifications: 1,
    social: 1,
    bgImageVersion: 1,
    bgImageId: 1,
    profilePicture: 1
  };
};

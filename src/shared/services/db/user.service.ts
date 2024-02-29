import { IBasicInfo, ISearchUser, IUserDocument, ISocialLinks, INotificationSettings } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';
import { AuthModel } from '@auth/models/auth.schema';
import * as followerService from './follower.service';
export async function addUserData(data: IUserDocument): Promise<void> {
  await UserModel.create(data);
}

export const updateUserProfile = async (userId: string, data: IUserDocument): Promise<void> => {
  console.log(userId, data);
  await UserModel.updateOne({ _id: userId }, data).exec();
};

export async function updatePassword(_id: string, hashedPassword: string): Promise<void> {
  await AuthModel.updateOne({ _id }, { $set: { password: hashedPassword } }).exec();
}
export async function getRandomUsers(userId: string): Promise<IUserDocument[]> {
  const randomUsers: IUserDocument[] = [];
  const users: IUserDocument[] = await UserModel.aggregate([
    { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
    { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
    { $unwind: '$authId' },
    { $sample: { size: 10 } },
    {
      $addFields: {
        username: '$authId.username',
        email: '$authId.email',
        avatarColor: '$authId.avatarColor',
        uId: '$authId.uId',
        createdAt: '$authId.createdAt'
      }
    },
    {
      $project: {
        authId: 0,
        __v: 0
      }
    }
  ]);
  const followers: string[] = await followerService.getFolloweesIds(`${userId}`);
  for (const user of users) {
    const followerIndex = followers.indexOf(user._id.toString());
    if (followerIndex < 0) {
      randomUsers.push(user);
    }
  }
  return randomUsers;
}
export async function updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        work: info['work'],
        school: info['school'],
        quote: info['quote'],
        location: info['location']
      }
    }
  ).exec();
}

export async function updateSocialLinks(userId: string, links: ISocialLinks): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { $set: { social: links } }).exec();
}

export async function updateNotificationSettings(userId: string, settings: INotificationSettings): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { $set: { notifications: settings } }).exec();
}

export async function getUserById(userId: string): Promise<IUserDocument> {
  const users: IUserDocument[] = await UserModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
    { $unwind: '$authId' },
    { $project: aggregateProject() }
  ]);
  return users[0];
}

export async function getUserByAuthId(authId: string): Promise<IUserDocument> {
  const users: IUserDocument[] = await UserModel.aggregate([
    { $match: { authId: new mongoose.Types.ObjectId(authId) } },
    { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
    { $unwind: '$authId' },
    { $project: aggregateProject() }
  ]);
  return users[0];
}

export async function getAllUsers(userId: string, skip: number, limit: number): Promise<IUserDocument[]> {
  const users: IUserDocument[] = await UserModel.aggregate([
    { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
    { $skip: skip },
    { $limit: limit },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
    { $unwind: '$authId' },
    { $project: aggregateProject() }
  ]);
  return users;
}

export async function getTotalUsersInDB(): Promise<number> {
  const totalCount: number = await UserModel.find({}).countDocuments();
  return totalCount;
}

export async function searchUsers(regex: RegExp): Promise<ISearchUser[]> {
  const users = await UserModel.aggregate([
    {
      $match: {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: regex } } }
        ]
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        profilePicture: 1
      }
    }
  ]);
  return users;
}

function aggregateProject() {
  return {
    _id: 1,
    firstName: 1,
    lastName: 1,
    privacy: 1,
    uId: '$authId.uId',
    email: '$authId.email',
    createdAt: '$authId.createdAt',
    postsCount: 1,
    work: 1,
    school: 1,
    quote: 1,
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
}

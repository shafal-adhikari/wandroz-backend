import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import * as userService from '@service/db/user.service';

const PAGE_SIZE = 12;

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

const allUsers: (params: IUserAll) => Promise<IAllUsers> = async ({ limit, skip, userId }) => {
  const users = await userService.getAllUsers(userId, skip, limit);
  const totalUsers: number = await usersCount();
  return { users, totalUsers };
};

const usersCount: () => Promise<number> = async () => {
  const totalUsers: number = await userService.getTotalUsersInDB();
  return totalUsers;
};

export const getAllUsers: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const { page } = req.params;
  const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
  const limit: number = PAGE_SIZE * parseInt(page);
  const newSkip: number = skip === 0 ? skip : skip + 1;
  const data = await allUsers({ newSkip, limit, skip, userId: `${req.currentUser!.userId}` });
  res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: data.users, totalUsers: data.totalUsers });
};

export const getUserProfile: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const existingUser: IUserDocument = await userService.getUserById(`${req.currentUser!.userId}`);
  console.log(existingUser);
  res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: existingUser });
};

export const profileByUserId: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const { userId } = req.params;

  const existingUser: IUserDocument = await userService.getUserById(userId);
  res.status(HTTP_STATUS.OK).json({ message: 'Get user profile by id', user: existingUser });
};

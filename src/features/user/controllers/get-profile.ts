import HTTP_STATUS from 'http-status-codes';
import { getUserById } from '@service/db/user.service';
import { getUserFromCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';

export const getProfile = async (req: Request, res: Response) => {
  const cachedUser: IUserDocument = (await getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
  const user = cachedUser ? cachedUser : await getUserById(`${req.currentUser!.userId}`);
  res.json(HTTP_STATUS.OK).json({ message: 'User Profile', user });
};

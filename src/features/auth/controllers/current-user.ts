import HTTP_STATUS from 'http-status-codes';
import { getUserById } from '@service/db/user.service';
import { getUserFromCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';

export const currentUser = async (req: Request, res: Response) => {
  let isUser = false;
  let token = null;
  let user = null;
  const cachedUser: IUserDocument = (await getUserFromCache(`${req.currentUser?.userId}`)) as IUserDocument;
  const exisitingUser: IUserDocument = cachedUser ? cachedUser : await getUserById(`${req.currentUser?.userId}`);
  if (Object.keys(exisitingUser).length) {
    isUser = true;
    token = req.session?.jwt;
    user = exisitingUser;
  }
  res.status(HTTP_STATUS.OK).json({ token, isUser, user });
};

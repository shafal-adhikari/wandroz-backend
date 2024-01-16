import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { escapeRegex } from '@global/helpers/helpers';
import * as userService from '@service/db/user.service';
import { ISearchUser } from '@user/interfaces/user.interface';

export const searchUser: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const regex = new RegExp(escapeRegex(req.params.query), 'i');
  const users: ISearchUser[] = await searchUsers(regex);
  res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
};

export const searchUsers: (regex: RegExp) => Promise<ISearchUser[]> = async (regex) => {
  const users: ISearchUser[] = await userService.searchUsers(regex);
  return users;
};

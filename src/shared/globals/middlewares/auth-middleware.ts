import { AuthPayload } from '@auth/interfaces/auth.interface';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';

export const verifyUser = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] || req.session?.jwt;
  if (!token) {
    throw new NotAuthorizedError();
  }
  try {
    const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN) as AuthPayload;
    req.currentUser = payload;
  } catch (error) {
    throw new NotAuthorizedError();
  }
  next();
};

export const checkAuthentication = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }
  next();
};

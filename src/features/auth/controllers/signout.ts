import { Response, Request } from 'express';
import HTTP_STATUS_CODES from 'http-status-codes';

export const signout = (req: Request, res: Response) => {
  req.session = null;
  res.status(HTTP_STATUS_CODES.OK).json({
    message: 'Logout Successfull',
    user: {},
    token: ''
  });
};

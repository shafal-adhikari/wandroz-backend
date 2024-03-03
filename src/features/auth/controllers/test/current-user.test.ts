import { Request, Response } from 'express';
import { currentUser } from '@auth/controllers/current-user';
import { authMockRequest, authMockResponse, authUserPayload } from '@root/mocks/auth.mock';
import { existingUser } from '@root/mocks/user.mock';
import * as userCache from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/db/user.service');

const FIRSTNAME = 'Shafal';
const LASTNAME = 'Shafal';
const PASSWORD = 'shafal1';

describe('current user', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token', () => {
    it('should set session token to null and send correct json response', async () => {
      const req: Request = authMockRequest(
        {},
        { firstName: FIRSTNAME, lastName: LASTNAME, password: PASSWORD },
        authUserPayload
      ) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userCache, 'getUserFromCache').mockResolvedValue({} as IUserDocument);

      await currentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: null,
        isUser: false,
        user: null
      });
    });

    it('should set session token and send correct json response', async () => {
      const req: Request = authMockRequest(
        { jwt: '12djdj34' },
        { firstName: FIRSTNAME, lastName: LASTNAME, password: PASSWORD },
        authUserPayload
      ) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(userCache, 'getUserFromCache').mockResolvedValue(existingUser);

      await currentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: req.session?.jwt,
        isUser: true,
        user: existingUser
      });
    });
  });
});

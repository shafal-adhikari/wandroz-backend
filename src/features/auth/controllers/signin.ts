import HTTP_STATUS from 'http-status-codes';
import { loginSchema } from '@auth/schemes/signin';
import { BadRequestError } from '@global/helpers/error-handler';
import { joiValidation } from '@global/validations/joiValidations';
import { config } from '@root/config';
import { getAuthUserByEmail } from '@service/db/auth.service';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { getUserByAuthId } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';
import { addEmailJob } from '@service/queues/email.queue';
import { loginTemplate } from '@service/emails/templates/login/login-template';

export const signIn = joiValidation(loginSchema)(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await getAuthUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('Invalid Credentials');
  }
  const passwordCheck = await existingUser.comparePassword(password);
  if (!passwordCheck) {
    addEmailJob('login-attempt', {
      receiverEmail: existingUser.email,
      subject: 'Login Attempt Made',
      template: loginTemplate(`${existingUser.email}`, req.ip!, Date.now().toLocaleString())
    });
    throw new BadRequestError('Invalid Credentials');
  }
  const user = await getUserByAuthId(existingUser._id.toString());
  const jwtToken = JWT.sign(
    {
      userId: user._id,
      uId: existingUser.uId,
      email: existingUser.email
    },
    config.JWT_TOKEN
  );
  const userDocument = {
    ...user,
    email: existingUser.email,
    authId: existingUser._id,
    uId: existingUser.uId,
    createdAt: existingUser.createdAt
  } as IUserDocument;
  req.session = { jwt: jwtToken };
  res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: jwtToken });
});

import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'ip';
import * as userService from '@service/db/user.service';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { BadRequestError } from '@global/helpers/error-handler';
import * as authService from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { passwordResetConfirmationTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { addEmailJob } from '@service/queues/email.queue';

export const changePassword: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new BadRequestError('Passwords do not match.');
  }

  const existingUser: IAuthDocument = await authService.getAuthUserByEmail(req.currentUser!.email);
  const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);

  if (!passwordsMatch) {
    throw new BadRequestError('Invalid credentials');
  }

  const hashedPassword: string = await existingUser.hashPassword(newPassword);
  userService.updatePassword(req.currentUser!.userId, hashedPassword);

  const templateParams: IResetPasswordParams = {
    email: existingUser.email!,
    ipaddress: publicIP.address(),
    date: moment().format('DD/MM/YYYY HH:mm')
  };

  const template: string = passwordResetConfirmationTemplate(templateParams);
  addEmailJob('changePassword', { template, receiverEmail: existingUser.email!, subject: 'Password update confirmation' });

  res.status(HTTP_STATUS.OK).json({
    message: 'Password updated successfully'
  });
};

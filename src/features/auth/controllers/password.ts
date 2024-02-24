import HTTP_STATUS from 'http-status-codes';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { joiValidation } from '@root/shared/globals/validations/joiValidations';
import { getAuthUserByEmail, getAuthUserByPasswordToken, updatePasswordToken } from '@service/db/auth.service';
import { passwordResetTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { addEmailJob } from '@service/queues/email.queue';
import { Request, Response } from 'express';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import publicIp from 'ip';
import moment from 'moment';
import crypto from 'crypto';
import { passwordResetConfirmationTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { getUserByAuthId } from '@service/db/user.service';

export const createResetPasswordToken = joiValidation(emailSchema)(async (req: Request, res: Response) => {
  const { email } = req.body;
  const existingAuthUser = await getAuthUserByEmail(email);
  if (!existingAuthUser) {
    throw new BadRequestError('Invalid credentials');
  }
  const user = await getUserByAuthId(existingAuthUser._id as string);
  const randomToken = crypto.randomUUID();
  await updatePasswordToken(`${existingAuthUser._id}`, randomToken, Date.now() * 60 * 60 * 1000);
  const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomToken}`;
  const template = passwordResetTemplate(`${user.firstName} ${user.lastName}`, resetLink);
  addEmailJob('forgotPasswordEmail', { template, receiverEmail: existingAuthUser.email, subject: 'Reset your password' });
  res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
});

export const resetPassword = joiValidation(passwordSchema)(async (req: Request, res: Response) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  if (password !== confirmPassword) {
    throw new BadRequestError('Passwords do not match');
  }
  const existingUser: IAuthDocument = await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError('Reset token has expired.');
  }

  existingUser.password = password;
  existingUser.passwordResetExpires = undefined;
  existingUser.passwordResetToken = undefined;
  await existingUser.save();

  const templateParams: IResetPasswordParams = {
    email: existingUser.email!,
    ipaddress: publicIp.address(),
    date: moment().format('DD//MM//YYYY HH:mm')
  };
  const template: string = passwordResetConfirmationTemplate(templateParams);
  addEmailJob('forgotPasswordEmail', { template, receiverEmail: existingUser.email!, subject: 'Password Reset Confirmation' });
  res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
});

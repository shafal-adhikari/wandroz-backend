import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

export const passwordResetConfirmationTemplate = (templateParams: IResetPasswordParams) => {
  const { username, email, ipaddress, date } = templateParams;
  return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf-8'), {
    username,
    email,
    ipaddress,
    date
  });
};

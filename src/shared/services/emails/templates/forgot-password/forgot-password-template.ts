import fs from 'fs';
import ejs from 'ejs';

export const passwordResetTemplate = (username: string, resetLink: string) => {
  return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf-8'), {
    username,
    resetLink
  });
};

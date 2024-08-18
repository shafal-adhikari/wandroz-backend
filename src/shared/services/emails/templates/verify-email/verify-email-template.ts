import fs from 'fs';
import ejs from 'ejs';

export const verifyEmailTemplate = (username: string, verifyLink: string) => {
  return ejs.render(fs.readFileSync(__dirname + '/verify-email-template.ejs', 'utf-8'), {
    username,
    verifyLink
  });
};

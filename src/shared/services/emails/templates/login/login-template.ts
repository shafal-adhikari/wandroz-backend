import fs from 'fs';
import ejs from 'ejs';

export const loginTemplate = (username: string, ipAddress: string, time: string) => {
  return ejs.render(fs.readFileSync(__dirname + '/login-template.ejs', 'utf-8'), {
    username,
    ipAddress,
    time
  });
};

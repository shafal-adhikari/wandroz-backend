import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

export const notificationMessageTemplate = (templateParams: INotificationTemplate): string => {
  const { header, message } = templateParams;
  return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf8'), {
    header,
    message,
    image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
  });
};

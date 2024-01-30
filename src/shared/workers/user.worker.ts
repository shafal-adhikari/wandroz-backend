import * as userService from '@service/db/user.service';
import { redisClient } from '@service/redis/redisClient';
import { IBasicInfo, INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import { Job, Worker } from 'bullmq';

export const instantiatieUserWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { value, key } = job.data;

      switch (job.name) {
        case 'addAuthUserToDB':
          await userService.addUserData(value as IUserDocument);
          break;
        case 'updateBasicInfoInDB':
          await userService.updateUserInfo(key!, value as IBasicInfo);
          break;
        case 'updateSocialLinksInDB':
          await userService.updateSocialLinks(key!, value as ISocialLinks);
          break;
        case 'updateNotificationSettings':
          await userService.updateNotificationSettings(key!, value as INotificationSettings);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

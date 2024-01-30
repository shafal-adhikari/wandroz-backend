import * as notificationService from '@service/db/notification.service';
import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
export const instantiatieNotificationWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { key } = job.data as INotificationJobData;

      switch (job.name) {
        case 'updateNotification':
          await notificationService.updateNotification(key);
          break;
        case 'deleteNotification':
          await notificationService.deleteNotification(key);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

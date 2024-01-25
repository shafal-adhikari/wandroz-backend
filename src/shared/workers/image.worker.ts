import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import * as imageService from '@service/db/image.service';
export const instantiatieImageWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { value, key, imgId, imgVersion } = job.data;

      switch (job.name) {
        case 'addUserProfileImageToDB':
          await imageService.addUserProfileImageToDB(key, value, imgId, imgVersion);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

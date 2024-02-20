import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import * as imageService from '@service/db/image.service';
export const instantiatieImageWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { key, imgId, imgVersion, imageId } = job.data;
      switch (job.name) {
        case 'updateBGImageInDB':
          await imageService.addBackgroundImageToDB(key, imgId, imgVersion);
          break;
        case 'addImageToDB':
          await imageService.addImage(key, imgId, imgVersion, '');
          break;
        case 'removeImageFromDB':
          await imageService.removeImageFromDB(imageId);
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

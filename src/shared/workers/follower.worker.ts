import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import * as followerService from '@service/db/follower.service';
export const instantiatieFollowerWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { keyOne, keyTwo, username, followerDocumentId } = job.data;

      switch (job.name) {
        case 'addFollowerToDB':
          await followerService.addFollowerToDB(keyOne, keyTwo, username, followerDocumentId);
          break;
        case 'removeFollowerFromDB':
          await followerService.removeFollowerFromDB(keyOne, keyTwo);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

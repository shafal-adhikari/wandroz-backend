import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import * as followerService from '@service/db/follower.service';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';
export const instantiatieFollowerWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { keyOne, keyTwo, username, followerDocumentId, status, acceptStatus } = job.data as IFollowerJobData;
      switch (job.name) {
        case 'addFollowerToDB':
          await followerService.addFollowerToDB(keyOne!, keyTwo!, username!, followerDocumentId!, status!);
          break;
        case 'updateFollowerStatus':
          await followerService.updateFollowerStatusToDB(keyOne!, keyTwo!, acceptStatus!);
          break;
        case 'removeFollowerFromDB':
          await followerService.removeFollowerFromDB(keyOne!, keyTwo!);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

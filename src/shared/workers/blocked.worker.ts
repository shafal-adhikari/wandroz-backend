import * as blockedService from '@service/db/block-user.service';
import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';
import { Types } from 'mongoose';
export const instantiatieBlockedWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { keyOne, keyTwo } = job.data as IBlockedUserJobData;
      const keyOneObjectId = new Types.ObjectId(keyOne);
      const keyTwoObjectId = new Types.ObjectId(keyTwo);
      switch (job.name) {
        case 'addBlockedUserToDB':
          await blockedService.blockUser(keyOneObjectId, keyTwoObjectId);
          break;
        case 'addUnblockedUserToDB':
          await blockedService.unblockUser(keyOneObjectId, keyTwoObjectId);
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

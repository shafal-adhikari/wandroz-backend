import * as reactionService from '@service/db/reaction.service';
import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';

export const instantiateReactionWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const data = job.data as IReactionJob;
      console.log(data, job.name, 'job coming');
      switch (job.name) {
        case 'addReactionToDB':
          await reactionService.addReactionDataToDB(data);
          break;
        case 'removeReactionFromDB':
          await reactionService.removeReactionDataFromDB(data);
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

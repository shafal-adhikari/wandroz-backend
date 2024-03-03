import * as commentService from '@service/db/comment.service';
import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import { ICommentJob } from '@root/features/comments/interfaces/comment.interface';

export const instantiateCommentWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const data = job.data as ICommentJob;
      switch (job.name) {
        case 'addCommentToDB':
          await commentService.addCommentToDB(data);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

import { Queue, QueueEvents } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob, IUserJob, IUserJobInfo } from '@user/interfaces/user.interface';
import { redisClient } from '@service/redis/redisClient';
import { IPostJobData } from '@post/interfaces/post.interface';
import { IFileImageJobData } from '@image/interfaces/image.interface';
import { ICommentJob } from '@root/features/comments/interfaces/comment.interface';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';

let bullAdapters: BullMQAdapter[] = [];
type IBaseJobData = IAuthJob | IUserJob | IEmailJob | IUserJobInfo | IPostJobData | IFileImageJobData | ICommentJob | IReactionJob;
export let serverAdapter: ExpressAdapter;
export const createQueue = (queueName: string) => {
  const queue = new Queue(queueName, {
    defaultJobOptions: {
      removeOnComplete: {
        age: 60
      },
      removeOnFail: {
        age: 24 * 3600
      }
    },
    connection: redisClient
  });
  const queueEvents = new QueueEvents(queueName, {
    connection: redisClient
  });
  queueEvents.on('failed', ({ jobId, failedReason }) => {
    console.log(`${jobId} failed with reason ${failedReason}`);
  });
  bullAdapters.push(new BullMQAdapter(queue));
  bullAdapters = [...new Set(bullAdapters)];
  serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  createBullBoard({
    queues: bullAdapters,
    serverAdapter
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addJob = (name: string, data: IBaseJobData): void => {
    queue.add(name, data, {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 3000
      }
    });
  };
  return {
    queue,
    addJob
  };
};

import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob } from '@user/interfaces/user.interface';

let bullAdapters: BullMQAdapter[] = [];
type IBaseJobData = IAuthJob | IEmailJob;
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
    connection: {
      host: 'localhost',
      port: 6379
    }
  });
  bullAdapters.push(new BullMQAdapter(queue));
  bullAdapters = [...new Set(bullAdapters)];
  serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  createBullBoard({
    queues: bullAdapters,
    serverAdapter
  });
  // queue.on('waiting', (job: Job) => {
  //   console.log(`${job} waiting`);
  // });
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

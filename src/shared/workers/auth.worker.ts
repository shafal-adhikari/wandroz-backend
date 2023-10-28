import { IAuthDocument, IAuthJob } from '@auth/interfaces/auth.interface';
import { createAuthUser } from '@service/db/auth.service';
import { Job, Worker } from 'bullmq';

export const instantiatieAuthWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { value } = job.data as IAuthJob;
      await createAuthUser(value as IAuthDocument);
    },
    {
      concurrency: 5,
      connection: {
        host: 'localhost',
        port: 6379
      }
    }
  );
};

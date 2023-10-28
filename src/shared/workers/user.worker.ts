import { addUserData } from '@service/db/user.service';
import { IUserDocument, IUserJob } from '@user/interfaces/user.interface';
import { Job, Worker } from 'bullmq';

export const instantiatieUserWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { value } = job.data as IUserJob;
      await addUserData(value as IUserDocument);
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

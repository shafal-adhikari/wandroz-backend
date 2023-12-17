import { sendEmail } from '@service/emails/mail-transport';
import { IEmailJob } from '@user/interfaces/user.interface';
import { Job, Worker } from 'bullmq';

export const instantiatieEmailWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { template, receiverEmail, subject } = job.data as IEmailJob;
      await sendEmail(receiverEmail, subject, template);
      console.log('email sent');
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

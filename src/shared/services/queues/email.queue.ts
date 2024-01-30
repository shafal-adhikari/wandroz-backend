import { instantiatieEmailWorker } from '@worker/email.worker';
import { IEmailJob } from './../../../features/user/interfaces/user.interface';
import { createQueue } from './createQueue';

const { addJob } = createQueue('email');
instantiatieEmailWorker('email');
export const addEmailJob = (name: string, data: IEmailJob): void => {
  console.log('email job added');
  addJob(name, data);
};

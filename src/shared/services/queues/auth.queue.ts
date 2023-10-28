import { IAuthJob } from '@auth/interfaces/auth.interface';
import { createQueue } from './createQueue';
import { instantiatieAuthWorker } from '@worker/auth.worker';

const { addJob } = createQueue('auth');
instantiatieAuthWorker('auth');
export const addAuthUserJob = (name: string, data: IAuthJob): void => {
  addJob(name, data);
};

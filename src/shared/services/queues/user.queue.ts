import { IAuthJob } from '@auth/interfaces/auth.interface';
import { createQueue } from './createQueue';
import { instantiatieUserWorker } from '@worker/user.worker';

const { addJob } = createQueue('user');
instantiatieUserWorker('user');
export const addUserJob = (name: string, data: IAuthJob): void => {
  addJob(name, data);
};

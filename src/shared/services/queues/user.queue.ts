import { IAuthJob } from '@auth/interfaces/auth.interface';
import { createQueue } from './createQueue';
import { instantiatieUserWorker } from '@worker/user.worker';
import { IUserJob } from '@user/interfaces/user.interface';

const { addJob } = createQueue('user');
instantiatieUserWorker('user');
export const addUserJob = (name: string, data: IAuthJob | IUserJob): void => {
  addJob(name, data);
};

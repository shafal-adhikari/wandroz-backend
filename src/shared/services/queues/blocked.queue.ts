import { createQueue } from './createQueue';
import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';
import { instantiatieBlockedWorker } from '@worker/blocked.worker';

const { addJob } = createQueue('blocked');
instantiatieBlockedWorker('blocked');

export const addBlockedUserJob = (name: string, data: IBlockedUserJobData): void => {
  addJob(name, data);
};

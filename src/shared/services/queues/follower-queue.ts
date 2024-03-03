import { createQueue } from './createQueue';
import { instantiatieFollowerWorker } from '@worker/follower.worker';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';

const { addJob } = createQueue('follower');
instantiatieFollowerWorker('follower');

export const addFollowerJob = (name: string, data: IFollowerJobData): void => {
  addJob(name, data);
};

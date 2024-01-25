import { createQueue } from './createQueue';
import { IPostJobData } from '@post/interfaces/post.interface';
import { instantiatiePostWorker } from '@worker/post.worker';

const { addJob } = createQueue('post');
instantiatiePostWorker('post');

export const addPostJob = (name: string, data: IPostJobData): void => {
  addJob(name, data);
};

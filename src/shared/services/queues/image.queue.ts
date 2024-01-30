import { createQueue } from './createQueue';
import { IFileImageJobData } from '@image/interfaces/image.interface';
import { instantiatieImageWorker } from '@worker/image.worker';

const { addJob } = createQueue('image');
instantiatieImageWorker('image');

export const addImageJob = (name: string, data: IFileImageJobData): void => {
  addJob(name, data);
};

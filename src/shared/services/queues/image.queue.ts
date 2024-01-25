import { createQueue } from './createQueue';
import { instantiatieUserWorker } from '@worker/user.worker';
import { IFileImageJobData } from '@image/interfaces/image.interface';

const { addJob } = createQueue('image');
instantiatieUserWorker('image');

export const addImageJob = (name: string, data: IFileImageJobData): void => {
  addJob(name, data);
};

import { ICommentJob } from '@root/features/comments/interfaces/comment.interface';
import { createQueue } from './createQueue';
import { instantiateCommentWorker } from '@worker/comment.worker';

const { addJob } = createQueue('comments');
instantiateCommentWorker('comments');

export const addCommentJob = (name: string, data: ICommentJob): void => {
  addJob(name, data);
};

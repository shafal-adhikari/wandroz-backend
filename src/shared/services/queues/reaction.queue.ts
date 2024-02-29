import { createQueue } from './createQueue';
import { instantiateReactionWorker } from '@worker/reaction.worker';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';

const { addJob } = createQueue('reaction');
instantiateReactionWorker('reaction');

export const addReactionJob = (name: string, data: IReactionJob): void => {
  addJob(name, data);
};

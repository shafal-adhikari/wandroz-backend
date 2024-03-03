import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { createQueue } from './createQueue';
import { instantiatieNotificationWorker } from '@worker/notification.worker';

const { addJob } = createQueue('notification');
instantiatieNotificationWorker('notification');

export const addNotificationJob = (name: string, data: INotificationJobData): void => {
  addJob(name, data);
};

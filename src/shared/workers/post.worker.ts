import { redisClient } from '@service/redis/redisClient';
import { Job, Worker } from 'bullmq';
import * as postService from '@service/db/post.service';
export const instantiatiePostWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { value, key, keyOne, keyTwo } = job.data;

      switch (job.name) {
        case 'addPostToDB':
          await postService.addPostToDb(key, value);
          break;
        case 'deletePostFromDB':
          await postService.deletePost(keyOne, keyTwo);
          break;
        case 'updatePostInDB':
          await postService.editPost(key, value);
          break;
      }
    },
    {
      concurrency: 5,
      connection: redisClient
    }
  );
};

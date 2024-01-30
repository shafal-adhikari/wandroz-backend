import { addPostJob } from '@service/queues/post.queue';
import { deletePostFromCache } from '@service/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  await deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);
  addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });
  res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
};

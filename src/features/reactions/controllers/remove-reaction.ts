import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { removePostReactionFromCache } from '@service/redis/reaction.cache';
import { addReactionJob } from '@service/queues/reaction.queue';
import { redisClient } from '@service/redis/redisClient';
import { IPostDocument } from '@post/interfaces/post.interface';
import { parseJson } from '@global/helpers/helpers';

export const removeReaction = async (req: Request, res: Response): Promise<void> => {
  const { postId, previousReaction } = req.body;
  const postData = (await redisClient.hgetall(`posts:${postId}`)) as unknown as IPostDocument;
  const reactions = parseJson(`${postData.reactions}`);
  reactions[previousReaction] = reactions[previousReaction] - 1;
  await removePostReactionFromCache(postId, req.currentUser!.userId, reactions!);

  addReactionJob('removeReactionFromDB', { postId, previousReaction, userFrom: req.currentUser!.userId });
  res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });
};

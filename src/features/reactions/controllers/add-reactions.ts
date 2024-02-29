import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { joiValidation } from '@global/validations/joiValidations';
import { addReactionSchema } from '@reactions/schemes/reactions';
import { savePostReactionToCache } from '@service/redis/reaction.cache';
import { addReactionJob } from '@service/queues/reaction.queue';

export const addReaction = joiValidation(addReactionSchema)(async (req: Request, res: Response): Promise<void> => {
  const { postId, type, previousReaction } = req.body;
  const reactionObject: IReactionDocument = {
    _id: new ObjectId(),
    postId,
    userId: req.currentUser!.userId,
    type
  } as IReactionDocument;

  await savePostReactionToCache(postId, reactionObject, type, previousReaction);

  const databaseReactionData: IReactionJob = {
    postId,
    userFrom: req.currentUser!.userId,
    type,
    previousReaction,
    reactionObject
  };
  addReactionJob('addReactionToDB', databaseReactionData);
  res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });
});

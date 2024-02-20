import { joiValidation } from '@global/validations/joiValidations';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { addCommentSchema } from '@comment/schemes/comment';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { addCommentJob } from '@service/queues/comment.queue';
import { savePostCommentToCache } from '@service/redis/comment.cache';

export const addComment = joiValidation(addCommentSchema)(async (req: Request, res: Response): Promise<void> => {
  const { userTo, postId, profilePicture, comment } = req.body;
  const commentObjectId: ObjectId = new ObjectId();
  const commentData: ICommentDocument = {
    _id: commentObjectId,
    postId,
    username: `${req.currentUser?.username}`,
    profilePicture,
    comment,
    createdAt: new Date()
  } as ICommentDocument;
  await savePostCommentToCache(postId, JSON.stringify(commentData));

  const databaseCommentData: ICommentJob = {
    postId,
    userTo,
    userFrom: req.currentUser!.userId,
    username: req.currentUser!.username,
    comment: commentData
  };
  addCommentJob('addCommentToDB', databaseCommentData);
  res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
});

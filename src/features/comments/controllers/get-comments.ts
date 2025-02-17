import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import * as commentService from '@service/db/comment.service';
import mongoose from 'mongoose';
import { getCommentsFromCache, getCommentsNamesFromCache, getSingleCommentFromCache } from '@service/redis/comment.cache';

export const getComments = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const cachedComments: ICommentDocument[] = await getCommentsFromCache(postId);
  const comments: ICommentDocument[] = cachedComments.length
    ? cachedComments
    : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ message: 'Post comments', comments });
};

export const getCommentsNames = async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  const cachedCommentsNames: ICommentNameList[] = await getCommentsNamesFromCache(postId);
  const commentsNames: ICommentNameList[] = cachedCommentsNames.length
    ? cachedCommentsNames
    : await commentService.getPostCommentNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ message: 'Post comments names', comments: commentsNames.length ? commentsNames[0] : [] });
};

export const getSingleComment = async (req: Request, res: Response): Promise<void> => {
  const { postId, commentId } = req.params;
  const cachedComments: ICommentDocument[] = await getSingleCommentFromCache(postId, commentId);
  const comments: ICommentDocument[] = cachedComments.length
    ? cachedComments
    : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ message: 'Single comment', comments: comments.length ? comments[0] : [] });
};

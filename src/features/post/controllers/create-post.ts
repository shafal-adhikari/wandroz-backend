import { joiValidation } from '@global/validations/joiValidations';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemes/post.schema';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { addPostJob } from '@service/queues/post.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { savePostToCache } from '@service/redis/post.cache';
import { addImageJob } from '@service/queues/image.queue';

export const createPost = joiValidation(postSchema)(async (req: Request, res: Response): Promise<void> => {
  const { post, bgColor, privacy, gifUrl, feelings } = req.body;
  const postObjectId: ObjectId = new ObjectId();
  const createdPost: IPostDocument = {
    _id: postObjectId,
    userId: req.currentUser!.userId,
    post,
    bgColor,
    feelings,
    privacy,
    gifUrl,
    commentsCount: 0,
    imgVersion: '',
    imgId: '',
    videoId: '',
    videoVersion: '',
    createdAt: new Date(),
    reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
  } as IPostDocument;
  await savePostToCache({
    key: postObjectId,
    currentUserId: `${req.currentUser!.userId}`,
    uId: `${req.currentUser!.uId}`,
    createdPost
  });
  addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
  res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
});

export const createPostWithImage = joiValidation(postWithImageSchema)(async (req: Request, res: Response): Promise<void> => {
  const { post, bgColor, privacy, gifUrl, feelings, image } = req.body;

  const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
  if (!result?.public_id) {
    throw new BadRequestError(result.message);
  }

  const postObjectId: ObjectId = new ObjectId();
  const createdPost: IPostDocument = {
    _id: postObjectId,
    userId: req.currentUser!.userId,
    post,
    bgColor,
    feelings,
    privacy,
    gifUrl,
    commentsCount: 0,
    imgVersion: result.version.toString(),
    imgId: result.public_id,
    videoId: '',
    videoVersion: '',
    createdAt: new Date(),
    reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
  } as IPostDocument;
  await savePostToCache({
    key: postObjectId,
    currentUserId: `${req.currentUser!.userId}`,
    uId: `${req.currentUser!.uId}`,
    createdPost
  });
  addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
  addImageJob('addImageToDB', {
    key: `${req.currentUser!.userId}`,
    imgId: result.public_id,
    imgVersion: result.version.toString()
  });
  res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully' });
});

export const createPostWithVideo = joiValidation(postWithVideoSchema)(async (req: Request, res: Response): Promise<void> => {
  const { post, bgColor, privacy, gifUrl, feelings, video } = req.body;

  const result: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
  if (!result?.public_id) {
    throw new BadRequestError(result.message);
  }

  const postObjectId: ObjectId = new ObjectId();
  const createdPost: IPostDocument = {
    _id: postObjectId,
    userId: req.currentUser!.userId,
    post,
    bgColor,
    feelings,
    privacy,
    gifUrl,
    commentsCount: 0,
    imgVersion: '',
    imgId: '',
    videoId: result.public_id,
    videoVersion: result.version.toString(),
    createdAt: new Date(),
    reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
  } as IPostDocument;
  await savePostToCache({
    key: postObjectId,
    currentUserId: `${req.currentUser!.userId}`,
    uId: `${req.currentUser!.uId}`,
    createdPost
  });
  addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
  res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with video successfully' });
});

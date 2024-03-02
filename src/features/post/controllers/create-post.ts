import { joiValidation } from '@global/validations/joiValidations';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema } from '@post/schemes/post.scheme';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { addPostJob } from '@service/queues/post.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { savePostToCache } from '@service/redis/post.cache';
import { addImageJob } from '@service/queues/image.queue';
import mongoose from 'mongoose';

export const createPost = joiValidation(postSchema)(async (req: Request, res: Response): Promise<void> => {
  const { post, privacy, images, feelings, videos, gifUrl } = req.body;
  const postObjectId: ObjectId = new mongoose.Types.ObjectId();
  const postImages: {
    imgId: string;
    imgVersion: string;
  }[] = req.files
    ? await Promise.all(
        images?.map(async (image: string) => {
          const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
          if (!result?.public_id) {
            throw new BadRequestError(result.message);
          }
          return { imgId: result.public_id, imgVersion: result.version.toString() };
        })
      )
    : [];
  const postVideos: {
    imgId: string;
    imgVersion: string;
  }[] = videos
    ? await Promise.all(
        videos?.map(async (video: string) => {
          const result: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
          if (!result?.public_id) {
            throw new BadRequestError(result.message);
          }
          return { imgId: result.public_id, imgVersion: result.version.toString() };
        })
      )
    : [];
  const createdPost: IPostDocument = {
    _id: `${postObjectId}`,
    userId: req.currentUser!.userId,
    post,
    feelings,
    privacy,
    commentsCount: 0,
    gifUrl: gifUrl,
    images: images?.length ? postImages : [],
    videos: videos?.length ? postVideos : [],
    createdAt: new Date(),
    reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
  } as IPostDocument;
  await savePostToCache({
    key: `${postObjectId}`,
    currentUserId: req.currentUser!.userId,
    uId: req.currentUser!.uId,
    createdPost
  });
  postImages.forEach(async (postImage) => {
    addImageJob('addImageToDB', {
      key: req.currentUser!.userId,
      imgId: postImage.imgId,
      imgVersion: postImage.imgVersion.toString()
    });
  });
  postVideos.forEach(async (postVideo) => {
    addImageJob('addImageToDB', {
      key: req.currentUser!.userId,
      imgId: postVideo.imgId,
      imgVersion: postVideo.imgVersion.toString()
    });
  });
  addPostJob('addPostToDB', { key: req.currentUser!.userId, value: createdPost });
  res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
});

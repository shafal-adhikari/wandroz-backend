import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postSchema } from '@post/schemes/post.scheme';
import { IPostDocument } from '@post/interfaces/post.interface';
import { updatePostInCache } from '@service/redis/post.cache';
import { addPostJob } from '@service/queues/post.queue';
import { addImageJob } from '@service/queues/image.queue';
import { joiValidation } from '@global/validations/joiValidations';
import { BadRequestError } from '@global/helpers/error-handler';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';

export const updatePosts = joiValidation(postSchema)(async (req: Request, res: Response): Promise<void> => {
  const { post, feelings, privacy, images, deletedImages, videos, deletedVideos, gifUrl } = req.body;
  const { postId } = req.params;
  deletedImages.forEach((imgId: string) => {
    addImageJob('removeImageFromDB', { imgId });
  });
  deletedVideos.forEach((imgId: string) => {
    addImageJob('removeImageFromDB', { imgId });
  });
  const postImages: {
    imgId: string;
    imgVersion: string;
  }[] = await Promise.all(
    images.map(async (image: string) => {
      const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      return { imgId: result.public_id, imgVersion: result.version.toString() };
    })
  );
  const postVideos: {
    imgId: string;
    imgVersion: string;
  }[] = await Promise.all(
    videos.map(async (video: string) => {
      const result: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      return { imgId: result.public_id, imgVersion: result.version.toString() };
    })
  );
  const updatedPost: IPostDocument = {
    post,
    privacy,
    feelings,
    videoId: '',
    images: images.length ? postImages : [],
    videos: videos.length ? postVideos : [],
    gifUrl: gifUrl,
    videoVersion: ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId, updatedPost);
  addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
});

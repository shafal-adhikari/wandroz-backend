import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { postSchema, postWithImageSchema, postWithVideoSchema } from '@post/schemes/post.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { updatePostInCache } from '@service/redis/post.cache';
import { addPostJob } from '@service/queues/post.queue';
import { addImageJob } from '@service/queues/image.queue';
import { joiValidation } from '@global/validations/joiValidations';

export const updatePosts = joiValidation(postSchema)(async (req: Request, res: Response): Promise<void> => {
  const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId } = req.body;
  const { postId } = req.params;
  const updatedPost: IPostDocument = {
    post,
    bgColor,
    privacy,
    feelings,
    gifUrl,
    imgId,
    imgVersion,
    videoId: '',
    videoVersion: ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId, updatedPost);
  addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
});

export const updatePostWithImage = joiValidation(postWithImageSchema)(async (req: Request, res: Response): Promise<void> => {
  const { imgId, imgVersion } = req.body;
  if (imgId && imgVersion) {
    updatePost(req);
  } else {
    const result: UploadApiResponse = await addImageToExistingPost(req);
    if (!result.public_id) {
      throw new BadRequestError(result.message);
    }
  }
  res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
});

export const updatePostWithVideo = joiValidation(postWithVideoSchema)(async (req: Request, res: Response): Promise<void> => {
  const { videoId, videoVersion } = req.body;
  if (videoId && videoVersion) {
    updatePost(req);
  } else {
    const result: UploadApiResponse = await addImageToExistingPost(req);
    if (!result.public_id) {
      throw new BadRequestError(result.message);
    }
  }
  res.status(HTTP_STATUS.OK).json({ message: 'Post with video updated successfully' });
});

const updatePost = async (req: Request): Promise<void> => {
  const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, videoId, videoVersion } = req.body;
  const { postId } = req.params;
  const updatedPost: IPostDocument = {
    post,
    bgColor,
    privacy,
    feelings,
    gifUrl,
    imgId: imgId ? imgId : '',
    imgVersion: imgVersion ? imgVersion : '',
    videoId: videoId ? videoId : '',
    videoVersion: videoVersion ? videoVersion : ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId, updatedPost);
  addPostJob('updatePostInDB', { key: postId, value: postUpdated });
};

const addImageToExistingPost = async (req: Request): Promise<UploadApiResponse> => {
  const { post, bgColor, feelings, privacy, gifUrl, image, video } = req.body;
  const { postId } = req.params;
  const result: UploadApiResponse = image
    ? ((await uploads(image)) as UploadApiResponse)
    : ((await videoUpload(video)) as UploadApiResponse);
  if (!result?.public_id) {
    return result;
  }
  const updatedPost: IPostDocument = {
    post,
    bgColor,
    privacy,
    feelings,
    gifUrl,
    imgId: image ? result.public_id : '',
    imgVersion: image ? result.version.toString() : '',
    videoId: video ? result.public_id : '',
    videoVersion: video ? result.version.toString() : ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId, updatedPost);
  addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  if (image) {
    addImageJob('addImageToDB', {
      key: `${req.currentUser!.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });
  }
  return result;
};

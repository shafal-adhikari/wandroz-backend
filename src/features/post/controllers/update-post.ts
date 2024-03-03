import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { updatePostInCache } from '@service/redis/post.cache';
import { addPostJob } from '@service/queues/post.queue';
import { BadRequestError } from '@global/helpers/error-handler';
import { uploads, videoUpload } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';

export const updatePosts = async (req: Request, res: Response): Promise<void> => {
  const { post, feelings, privacy, images, videos, gifUrl, prevImages } = req.body;
  const { postId } = req.params;
  const postImages: {
    imgId: string;
    imgVersion: string;
  }[] = images
    ? await Promise.all(
        images.map(async (image: string) => {
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
        videos.map(async (video: string) => {
          const result: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
          if (!result?.public_id) {
            throw new BadRequestError(result.message);
          }
          return { imgId: result.public_id, imgVersion: result.version.toString() };
        })
      )
    : [];
  const updatedPost: IPostDocument = {
    post,
    privacy,
    feelings,
    videoId: '',
    images: images && images.length > 0 ? [...postImages, ...prevImages] : [...prevImages],
    videos: videos && videos.length > 0 ? postVideos : [],
    gifUrl: gifUrl,
    videoVersion: ''
  } as IPostDocument;

  const postUpdated: IPostDocument = await updatePostInCache(postId, updatedPost);
  addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
};

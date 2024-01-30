import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import * as postService from '@service/db/post.service';
import {
  getPostsFromCache,
  getPostsWithImagesFromCache,
  getPostsWithVideosFromCache,
  getTotalPostsInCache
} from '@service/redis/post.cache';

const PAGE_SIZE = 10;

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const { page } = req.params;
  const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
  const limit: number = PAGE_SIZE * parseInt(page);
  const newSkip: number = skip === 0 ? skip : skip + 1;
  let posts: IPostDocument[] = [];
  let totalPosts = 0;
  const cachedPosts: IPostDocument[] = await getPostsFromCache('post', newSkip, limit);
  if (cachedPosts.length) {
    posts = cachedPosts;
    totalPosts = await getTotalPostsInCache();
  } else {
    posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
    totalPosts = await postService.getPostsCount();
  }
  res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
};

export const getPostsWithImages = async (req: Request, res: Response): Promise<void> => {
  const { page } = req.params;
  const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
  const limit: number = PAGE_SIZE * parseInt(page);
  const newSkip: number = skip === 0 ? skip : skip + 1;
  let posts: IPostDocument[] = [];
  const cachedPosts: IPostDocument[] = await getPostsWithImagesFromCache('post', newSkip, limit);
  posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ images: '', gifUrl: '' }, skip, limit, { createdAt: -1 });
  res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
};

export const getPostsWithVideos = async (req: Request, res: Response): Promise<void> => {
  const { page } = req.params;
  const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
  const limit: number = PAGE_SIZE * parseInt(page);
  const newSkip: number = skip === 0 ? skip : skip + 1;
  let posts: IPostDocument[] = [];
  const cachedPosts: IPostDocument[] = await getPostsWithVideosFromCache('post', newSkip, limit);
  posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ videos: '$ne' }, skip, limit, { createdAt: -1 });
  res.status(HTTP_STATUS.OK).json({ message: 'All posts with videos', posts });
};

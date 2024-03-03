import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import * as postService from '@service/db/post.service';
import { getPostFromCache, getPostsFromCache, getTotalPostsInCache } from '@service/redis/post.cache';
import { config } from '@root/config';

const PAGE_SIZE = 10;

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const { page } = req.params;
  const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
  const limit: number = PAGE_SIZE * parseInt(page);
  const newSkip: number = skip === 0 ? skip : skip + 1;
  let posts: IPostDocument[] = [];
  let totalPosts = 0;
  const cachedPosts: IPostDocument[] = await getPostsFromCache('post', newSkip, limit);
  // cachedPosts = cachedPosts.filter(cache);
  if (cachedPosts.length) {
    posts = cachedPosts;
    totalPosts = await getTotalPostsInCache();
  } else {
    posts = await postService.getPosts({ privacy: 'Public' }, skip, limit, { createdAt: -1 });
    totalPosts = await postService.getPostsCount();
  }
  posts = posts.map((post) => {
    const reaction = post.allReactions?.find((reaction) => reaction.userId == req.currentUser?.userId);
    post.userReaction = reaction ? reaction.type : '';
    post.imageLinks = post.images
      ? post.images?.map((image) => {
          return `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${image.imgVersion}/${image.imgId}`;
        })
      : [];
    post.videoLinks = post.videos
      ? post.videos.map((image) => {
          return `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${image.imgVersion}/${image.imgId}`;
        })
      : [];
    return post;
  });
  res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const cachedPost: IPostDocument = await getPostFromCache(id);
  console.log(cachedPost);
  const post = cachedPost ? cachedPost : await postService.getPost(id);
  const reaction = post.allReactions?.find((reaction) => reaction.userId == req.currentUser?.userId);
  post.userReaction = reaction ? reaction.type : '';
  post.imageLinks = post.images
    ? post.images?.map((image) => {
        return `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${image.imgVersion}/${image.imgId}`;
      })
    : [];
  res.status(HTTP_STATUS.OK).json({ message: 'All posts', post });
};

import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { redisClient } from './redisClient';
import { ServerError } from '@global/helpers/error-handler';
import { parseJson } from '@global/helpers/helpers';
import { IReactions } from '@reactions/interfaces/reaction.interface';

export const savePostToCache = async (data: ISavePostToCache): Promise<void> => {
  const createdAt = new Date();
  let list: string[] = [];
  for (const [key, value] of Object.entries(data.createdPost)) {
    list.push(`${key}`);
    if (typeof value == 'object') {
      list.push(JSON.stringify(value));
    } else {
      list.push(`${value}`);
    }
  }
  list = [...list, 'createdAt', `${createdAt}`];
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const postCount: string[] = await redisClient.HMGET(`users:${data.currentUserId}`, 'postsCount');
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    await redisClient.ZADD('post', { score: parseInt(data.uId, 10), value: `${data.key}` });
    multi.HSET(`posts:${data.key}`, list);
    const count: number = parseInt(postCount[0]) + 1;
    multi.HSET(`users:${data.currentUserId}`, ['postsCount', count]);
    multi.exec();
  } catch (error) {
    throw new ServerError();
  }
};

export const getPostsFromCache = async (key: string, start: number, end: number): Promise<IPostDocument[]> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const reply: string[] = await redisClient.ZRANGE(key, start, end, { REV: true });
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.HGETALL(`posts:${value}`);
    }
    const replies = (await multi.exec()) as unknown as IPostDocument[];
    const postReplies: IPostDocument[] = [];
    for (const post of replies) {
      post.commentsCount = parseJson(`${post.commentsCount}`) as number;
      post.reactions = parseJson(`${post.reactions}`) as IReactions;
      post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
      postReplies.push(post);
    }

    return postReplies;
  } catch (error) {
    throw new ServerError();
  }
};

export const getTotalPostsInCache = async (): Promise<number> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const count: number = await redisClient.ZCARD('post');
    return count;
  } catch (error) {
    throw new ServerError();
  }
};

export const getPostsWithImagesFromCache = async (key: string, start: number, end: number): Promise<IPostDocument[]> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const reply: string[] = await redisClient.ZRANGE(key, start, end, { REV: true });
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.HGETALL(`posts:${value}`);
    }
    const replies = (await multi.exec()) as unknown as IPostDocument[];
    const postWithImages: IPostDocument[] = [];
    for (const post of replies as IPostDocument[]) {
      if ((post.imgId && post.imgVersion) || post.gifUrl) {
        post.commentsCount = parseJson(`${post.commentsCount}`) as number;
        post.reactions = parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
        postWithImages.push(post);
      }
    }
    return postWithImages;
  } catch (error) {
    throw new ServerError();
  }
};

export const getPostsWithVideosFromCache = async (key: string, start: number, end: number): Promise<IPostDocument[]> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const reply: string[] = await redisClient.ZRANGE(key, start, end, { REV: true });
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.HGETALL(`posts:${value}`);
    }
    const replies = (await multi.exec()) as unknown as IPostDocument[];
    const postWithVideos: IPostDocument[] = [];
    for (const post of replies as IPostDocument[]) {
      if (post.videoId && post.videoVersion) {
        post.commentsCount = parseJson(`${post.commentsCount}`) as number;
        post.reactions = parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
        postWithVideos.push(post);
      }
    }
    return postWithVideos;
  } catch (error) {
    throw new ServerError();
  }
};

export const getUserPostsFromCache = async (key: string, uId: number): Promise<IPostDocument[]> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const reply: string[] = await redisClient.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.HGETALL(`posts:${value}`);
    }
    const replies = (await multi.exec()) as unknown as IPostDocument[];
    const postReplies: IPostDocument[] = [];
    for (const post of replies as IPostDocument[]) {
      post.commentsCount = parseJson(`${post.commentsCount}`) as number;
      post.reactions = parseJson(`${post.reactions}`) as IReactions;
      post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
      postReplies.push(post);
    }
    return postReplies;
  } catch (error) {
    throw new ServerError();
  }
};

export const getTotalUserPostsInCache = async (uId: number): Promise<number> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const count: number = await redisClient.ZCOUNT('post', uId, uId);
    return count;
  } catch (error) {
    throw new ServerError();
  }
};

export const deletePostFromCache = async (key: string, currentUserId: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const postCount: string[] = await redisClient.HMGET(`users:${currentUserId}`, 'postsCount');
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    multi.ZREM('post', `${key}`);
    multi.DEL(`posts:${key}`);
    multi.DEL(`comments:${key}`);
    multi.DEL(`reactions:${key}`);
    const count: number = parseInt(postCount[0], 10) - 1;
    multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
    await multi.exec();
  } catch (error) {
    throw new ServerError();
  }
};

export const updatePostInCache = async (key: string, updatedPost: IPostDocument): Promise<IPostDocument> => {
  const list: string[] = [];
  for (const [key, value] of Object.entries(updatedPost)) {
    list.push(`${key}`);
    if (typeof value == 'object') {
      list.push(JSON.stringify(value));
    } else {
      list.push(`${value}`);
    }
  }
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.HSET(`posts:${key}`, list);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    multi.HGETALL(`posts:${key}`);
    const reply = (await multi.exec()) as unknown as IPostDocument[];
    const postReply = reply as IPostDocument[];
    postReply[0].commentsCount = parseJson(`${postReply[0].commentsCount}`) as number;
    postReply[0].reactions = parseJson(`${postReply[0].reactions}`) as IReactions;
    postReply[0].createdAt = new Date(parseJson(`${postReply[0].createdAt}`)) as Date;

    return postReply[0];
  } catch (error) {
    throw new ServerError();
  }
};

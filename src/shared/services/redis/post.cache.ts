import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { redisClient } from './redisClient';
import { ServerError } from '@global/helpers/error-handler';
import { parseJson } from '@global/helpers/helpers';
import { IReactions } from '@reactions/interfaces/reaction.interface';
import { IUserDocument } from '@user/interfaces/user.interface';

export const savePostToCache = async (data: ISavePostToCache): Promise<void> => {
  const createdAt = new Date();
  let list: string[] = [];
  for (const [key, value] of Object.entries(data.createdPost)) {
    list.push(key);
    if (typeof value == 'object') {
      list.push(JSON.stringify(value));
    } else {
      list.push(`${value}`);
    }
  }
  list = [...list, 'createdAt', `${createdAt}`];
  try {
    const postCount: (string | null)[] = await redisClient.hmget(`users:${data.currentUserId}`, 'postsCount');
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    await redisClient.zadd('post', data.uId, `${data.key}`);
    multi.hset(`posts:${data.key}`, list);
    const count: number = parseInt(postCount[0] ?? '0') + 1;
    multi.hset(`users:${data.currentUserId}`, ['postsCount', count]);
    multi.exec();
  } catch (error) {
    console.log(error);
    throw new ServerError();
  }
};

export const getPostsFromCache = async (key: string, start: number, end: number): Promise<IPostDocument[]> => {
  try {
    const reply: string[] = await redisClient.zrevrange(key, start, end);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      console.log('this running: ', value);
      multi.hgetall(`posts:${value}`);
    }
    const replies = (await multi.exec()) as [Error | null, IPostDocument][];
    const postReplies: IPostDocument[] = [];
    for (const data of replies) {
      const [error, post] = data;
      if (error) {
        throw error;
      }
      const user = (await redisClient.hgetall(`users:${post.userId}`)) as unknown as IUserDocument;
      post.profilePicture = user.profilePicture;
      post.commentsCount = parseJson(`${post.commentsCount}`) as number;
      post.reactions = parseJson(`${post.reactions}`) as IReactions;
      post.images = parseJson(`${post.images}`) as { imgId: string; imgVersion: string }[];
      post.videos = parseJson(`${post.videos}`) as { imgId: string; imgVersion: string }[];
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
    const count: number = await redisClient.zcard('post');
    return count;
  } catch (error) {
    throw new ServerError();
  }
};

export const getPostsWithImagesFromCache = async (key: string, start: number, end: number): Promise<IPostDocument[]> => {
  try {
    const reply: string[] = await redisClient.zrevrange(key, start, end);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.hgetall(`posts:${value}`);
    }
    const replies = (await multi.exec()) as [Error | null, IPostDocument][];
    const postWithImages: IPostDocument[] = [];
    for (const data of replies) {
      const [error, post] = data;
      if (error) {
        throw new ServerError();
      }
      if ((post.images && parseJson(`${post.images}`).length) || post.gifUrl) {
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
    const reply: string[] = await redisClient.zrevrange(key, start, end);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.hgetall(`posts:${value}`);
    }
    const replies = (await multi.exec()) as [Error | null, IPostDocument][];
    const postWithVideos: IPostDocument[] = [];
    for (const data of replies) {
      const [error, post] = data;
      if (error) {
        throw new ServerError();
      }
      if (post.videos && parseJson(`${post.videos}`).length) {
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
    const reply: string[] = await redisClient.zrangebyscore(key, uId, uId);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    for (const value of reply) {
      multi.hgetall(`posts:${value}`);
    }
    const replies = (await multi.exec()) as [Error | null, IPostDocument][];
    const postReplies: IPostDocument[] = [];
    for (const data of replies) {
      const [error, post] = data;
      if (error) {
        throw new ServerError();
      }
      post.commentsCount = parseJson(`${post.commentsCount}`) as number;
      post.reactions = parseJson(`${post.reactions}`) as IReactions;
      post.createdAt = new Date(parseJson(`${post.createdAt}`)) as Date;
      post.images = parseJson(`${post.images}`);
      post.videos = parseJson(`${post.videos}`);
      postReplies.push(post);
    }
    return postReplies;
  } catch (error) {
    throw new ServerError();
  }
};

export const getTotalUserPostsInCache = async (uId: number): Promise<number> => {
  try {
    const count: number = await redisClient.zcount('post', uId, uId);
    return count;
  } catch (error) {
    throw new ServerError();
  }
};

export const deletePostFromCache = async (key: string, currentUserId: string): Promise<void> => {
  try {
    const postCount: (string | null)[] = await redisClient.hmget(`users:${currentUserId}`, 'postsCount');
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    multi.zrem('post', `${key}`);
    multi.del(`posts:${key}`);
    multi.del(`comments:${key}`);
    multi.del(`reactions:${key}`);
    const count: number = parseInt(postCount[0] ?? '0', 10) - 1;
    multi.hset(`users:${currentUserId}`, ['postsCount', count]);
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
    await redisClient.hset(`posts:${key}`, list);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    multi.hgetall(`posts:${key}`);
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

import { find } from 'lodash';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { redisClient } from './redisClient';
import { parseJson } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';

export const savePostCommentToCache = async (postId: string, value: string): Promise<void> => {
  try {
    await redisClient.lpush(`comments:${postId}`, value);
    const commentsCount: (string | null)[] = await redisClient.hmget(`posts:${postId}`, 'commentsCount');
    let count: number = parseJson(commentsCount[0] ?? '0') as number;
    count += 1;
    const dataToSave: string[] = ['commentsCount', `${count}`];
    await redisClient.hset(`posts:${postId}`, dataToSave);
  } catch (error) {
    throw new ServerError();
  }
};

export const getCommentsFromCache = async (postId: string): Promise<ICommentDocument[]> => {
  try {
    const reply: string[] = await redisClient.lrange(`comments:${postId}`, 0, -1);
    const list: ICommentDocument[] = [];
    for (const item of reply) {
      list.push(parseJson(item));
    }
    return list;
  } catch (error) {
    throw new ServerError();
  }
};

export const getCommentsNamesFromCache = async (postId: string): Promise<ICommentNameList[]> => {
  try {
    const commentsCount: number = await redisClient.llen(`comments:${postId}`);
    const comments: string[] = await redisClient.lrange(`comments:${postId}`, 0, -1);
    const list: string[] = [];
    for (const item of comments) {
      const comment: ICommentDocument = parseJson(item) as ICommentDocument;
      list.push(comment.username);
    }
    const response: ICommentNameList = {
      count: commentsCount,
      names: list
    };
    return [response];
  } catch (error) {
    throw new ServerError();
  }
};

export const getSingleCommentFromCache = async (postId: string, commentId: string): Promise<ICommentDocument[]> => {
  try {
    const comments: string[] = await redisClient.lrange(`comments:${postId}`, 0, -1);
    const list: ICommentDocument[] = [];
    for (const item of comments) {
      list.push(parseJson(item));
    }
    const result: ICommentDocument = find(list, (listItem: ICommentDocument) => {
      return listItem._id === commentId;
    }) as ICommentDocument;

    return [result];
  } catch (error) {
    throw new ServerError();
  }
};

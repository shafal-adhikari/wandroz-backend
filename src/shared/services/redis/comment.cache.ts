import { find } from 'lodash';
import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { redisClient } from './redisClient';
import { parseJson } from '@global/helpers/helpers';
import { ServerError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';

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
      const comment: ICommentDocument = parseJson(item);
      const user = (await redisClient.hgetall(`users:${comment.userId}`)) as unknown as IUserDocument;
      console.log(user);
      comment.firstName = user.firstName;
      comment.lastName = user.lastName;
      comment.profilePicture = user.profilePicture;
      list.push(comment);
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
      const user = (await redisClient.hgetall(`users:${comment.userId}`)) as unknown as IUserDocument;
      list.push(`${user.firstName} ${user.lastName}`);
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
    const user = (await redisClient.hgetall(`users:${result.userId}`)) as unknown as IUserDocument;
    result.firstName = user.firstName;
    result.lastName = user.lastName;
    result.profilePicture = user.profilePicture;
    return [result];
  } catch (error) {
    throw new ServerError();
  }
};

import { find } from 'lodash';
import { ServerError } from '@global/helpers/error-handler';
import { IReactionDocument, IReactions } from '@reactions/interfaces/reaction.interface';
import { redisClient } from './redisClient';
import { parseJson } from '@global/helpers/helpers';
import { IPostDocument } from '@post/interfaces/post.interface';
import { IUserDocument } from '@user/interfaces/user.interface';

export async function savePostReactionToCache(key: string, reaction: IReactionDocument, type: string, previousReaction: string) {
  try {
    const postData = (await redisClient.hgetall(`posts:${key}`)) as unknown as IPostDocument;
    const reactions = parseJson(`${postData.reactions}`);

    if (previousReaction && previousReaction.length) {
      reactions[previousReaction as keyof typeof reactions] = reactions[previousReaction as keyof typeof reactions] - 1;

      removePostReactionFromCache(key, reaction.userId, reactions!);
    }
    reactions[type as keyof typeof reactions] = reactions[type as keyof typeof reactions] + 1;
    if (type) {
      redisClient.lpush(`reactions:${key}`, JSON.stringify(reaction));
      const dataToSave: string[] = ['reactions', JSON.stringify(reactions)];
      redisClient.hset(`posts:${key}`, dataToSave);
    }
  } catch (error) {
    console.log(error);
    throw new ServerError();
  }
}

export async function removePostReactionFromCache(key: string, userId: string, postReactions: IReactions) {
  try {
    const response: string[] = await redisClient.lrange(`reactions:${key}`, 0, -1);
    const multi: ReturnType<typeof redisClient.multi> = redisClient.multi();
    const userPreviousReaction: IReactionDocument = getPreviousReaction(response, userId) as IReactionDocument;
    multi.lrem(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
    await multi.exec();

    const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
    await redisClient.hset(`posts:${key}`, dataToSave);
  } catch (error) {
    throw new ServerError();
  }
}

export const getReactionsFromCache = async (postId: string): Promise<[IReactionDocument[], number]> => {
  try {
    const reactionsCount: number = await redisClient.llen(`reactions:${postId}`);
    const response: string[] = await redisClient.lrange(`reactions:${postId}`, 0, -1);
    const list: IReactionDocument[] = [];
    for (const item of response) {
      const reaction: IReactionDocument = parseJson(item);
      const user = (await redisClient.hgetall(`users:${reaction.userId}`)) as unknown as IUserDocument;
      reaction.firstName = user.firstName;
      reaction.lastName = user.lastName;
      reaction.profilePicture = user.profilePicture;
      list.push(reaction);
    }
    if (response.length > 0) {
      return [list, reactionsCount];
    } else {
      return [[], 0];
    }
  } catch (error) {
    throw new ServerError();
  }
};

export async function getSingleReactionByUsernameFromCache(postId: string, username: string) {
  try {
    const response: string[] = await redisClient.lrange(`reactions:${postId}`, 0, -1);
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(parseJson(item));
    }
    const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
      return listItem?.postId === postId && listItem?.userId === username;
    }) as IReactionDocument;
    if (result) {
      const user = (await redisClient.hgetall(`users:${result.userId}`)) as unknown as IUserDocument;
      result.firstName = user.firstName;
      result.lastName = user.lastName;
      result.profilePicture = user.profilePicture;
    }

    return result ? [result, 1] : [];
  } catch (error) {
    throw new ServerError();
  }
}

function getPreviousReaction(response: string[], userId: string) {
  const list: IReactionDocument[] = [];
  for (const item of response) {
    list.push(parseJson(item) as IReactionDocument);
  }
  return find(list, (listItem: IReactionDocument) => {
    return listItem.userId === userId;
  });
}

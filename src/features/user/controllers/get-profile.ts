import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { AccountPrivacy, IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import * as userService from '@service/db/user.service';
import * as postService from '@service/db/post.service';
import { getRandomUsersFromCache, getUserFromCache } from '@service/redis/user.cache';
import { getUserPostsFromCache } from '@service/redis/post.cache';
import { IPostDocument } from '@post/interfaces/post.interface';
import { getFolloweesIds, getPendingFolloweesId } from '@service/db/follower.service';
import { getFollowersFromCache } from '@service/redis/follower.cache';
import { omit } from 'lodash';
import { config } from '@root/config';
const PAGE_SIZE = 12;

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

const allUsers: (params: IUserAll) => Promise<IAllUsers> = async ({ limit, skip, userId }) => {
  const users = await userService.getAllUsers(userId, skip, limit);
  const totalUsers: number = await usersCount();
  return { users, totalUsers };
};

const usersCount: () => Promise<number> = async () => {
  const totalUsers: number = await userService.getTotalUsersInDB();
  return totalUsers;
};
export const randomUserSuggestions = async (req: Request, res: Response): Promise<void> => {
  let randomUsers: IUserDocument[] = [];
  const cachedUsers: IUserDocument[] = await getRandomUsersFromCache(`${req.currentUser!.userId}`);
  if (cachedUsers.length) {
    randomUsers = [...cachedUsers];
  } else {
    const users: IUserDocument[] = await userService.getRandomUsers(req.currentUser!.userId);
    randomUsers = [...users];
  }
  res.status(HTTP_STATUS.OK).json({ message: 'User suggestions', users: randomUsers });
};

export const getAllUsers: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const { page } = req.params;
  const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
  const limit: number = PAGE_SIZE * parseInt(page);
  const newSkip: number = skip === 0 ? skip : skip + 1;
  const data = await allUsers({ newSkip, limit, skip, userId: `${req.currentUser!.userId}` });
  res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: data.users, totalUsers: data.totalUsers });
};

export const getUserProfile: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const cachedUser: IUserDocument = (await getUserFromCache(req.currentUser!.userId)) as IUserDocument;
  const user: IUserDocument = cachedUser ?? (await userService.getUserById(`${req.currentUser!.userId}`));
  res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: user });
};

export const getProfilePosts = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const cachedUser: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
  let userPosts: IPostDocument[];
  if (cachedUser.privacy == 'PRIVATE') {
    const followers =
      (await getFollowersFromCache(`following:${req.currentUser!.userId}`)) ?? (await getFolloweesIds(req.currentUser!.userId));
    const isFollowing = followers.find((follower) => follower._id?.toString() == userId);
    if (!isFollowing && userId !== req.currentUser!.userId) {
      userPosts = [];
      res.status(HTTP_STATUS.OK).json({ message: 'Get user profile and posts', posts: userPosts, privacy: 'PRIVATE' });
      return;
    }
  }
  const cachedUserPosts: IPostDocument[] = await getUserPostsFromCache('post', parseInt(cachedUser.uId!, 10));

  userPosts = cachedUserPosts.length
    ? cachedUserPosts
    : await postService.getPosts({ userId: userId, privacy: userId !== req.currentUser!.userId ? 'Public' : undefined }, 0, 100, {
        createdAt: -1
      });
  userPosts = userPosts.map((post) => {
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
  res.status(HTTP_STATUS.OK).json({ message: 'Get user profile and posts', posts: userPosts });
};

export const profileByUserId: (req: Request, res: Response) => Promise<void> = async (req, res) => {
  const { userId } = req.params;
  const pendingFollowRequests = await getPendingFolloweesId(req.currentUser!.userId);
  const hasSentRequest = pendingFollowRequests.find((id) => id == userId);
  let followStatus = hasSentRequest ? 'PENDING' : 'NOT_FOLLOWING';
  if (!hasSentRequest) {
    const cacheFollowings = await getFollowersFromCache(`$followers:${req.currentUser!.userId}`);
    const currentUserFollowings = cacheFollowings.length ? cacheFollowings : await getFolloweesIds(req.currentUser!.userId);
    const hasFollowedUser = currentUserFollowings.find((value) => value == userId);
    if (hasFollowedUser) followStatus = 'FOLLOWING';
  }
  const cachedUser: IUserDocument = (await getUserFromCache(userId)) as IUserDocument;
  let user: Partial<IUserDocument> = cachedUser ?? (await userService.getUserById(`${userId}`));
  if (user.privacy == AccountPrivacy.PRIVATE && followStatus !== 'FOLLOWING') {
    user = {
      _id: user._id,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      firstName: user.firstName,
      lastName: user.lastName,
      privacy: user.privacy,
      profilePicture: user.profilePicture
    };
  }
  user = omit(user, ['blocked', 'blockedBy', 'notifications']);
  res.status(HTTP_STATUS.OK).json({ message: 'Get user profileby id', user: { ...user, followingStatus: followStatus } });
};

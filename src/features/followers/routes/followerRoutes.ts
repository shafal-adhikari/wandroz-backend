import express from 'express';
import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { getUserFollowers, getUserFollowing } from '@follower/controllers/get-followers';
import { followUser } from '@follower/controllers/follow-user';
import { removeFollower } from '@follower/controllers/unfollow-user';
import { block, unblock } from '@follower/controllers/block-user';
import { getFolloweeRequests, getFollowerRequests } from '@follower/controllers/get-follow-request';
import { acceptFollowStatus } from '@follower/controllers/accept-follower';

const router = express.Router();

router.get('/user/following', checkAuthentication, getUserFollowing);
router.get('/user/followers/:userId', checkAuthentication, getUserFollowers);
router.get('/user/follow-requests', checkAuthentication, getFollowerRequests);
router.get('/user/follow-requests/sent', checkAuthentication, getFolloweeRequests);

router.put('/user/follow-requests/accept', checkAuthentication, acceptFollowStatus);

router.put('/user/follow/:followeeId', checkAuthentication, followUser);
router.put('/user/unfollow/:followeeId', checkAuthentication, removeFollower);
router.put('/user/block/:followerId', checkAuthentication, block);
router.put('/user/unblock/:followerId', checkAuthentication, unblock);

export const followerRoutes = router;

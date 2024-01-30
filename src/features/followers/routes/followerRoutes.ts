import express from 'express';
import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { getUserFollowers, getUserFollowing } from '@follower/controllers/get-followers';
import { updateFollower } from '@follower/controllers/follower-user';
import { removeFollower } from '@follower/controllers/unfollow-user';
import { block, unblock } from '@follower/controllers/block-user';

const router = express.Router();

router.get('/user/following', checkAuthentication, getUserFollowing);
router.get('/user/followers/:userId', checkAuthentication, getUserFollowers);

router.put('/user/follow/:followerId', checkAuthentication, updateFollower);
router.put('/user/unfollow/:followeeId/:followerId', checkAuthentication, removeFollower);
router.put('/user/block/:followerId', checkAuthentication, block);
router.put('/user/unblock/:followerId', checkAuthentication, unblock);

export const followerRoutes = router;

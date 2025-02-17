import express, { Router } from 'express';
import { getAllUsers, getProfilePosts, getUserProfile, profileByUserId, randomUserSuggestions } from '@user/controllers/get-profile';
import { searchUser } from '@user/controllers/search-user';
import { changePassword } from '@user/controllers/change-password';
import { updateBasicInfo, updateSocialLinks } from '@user/controllers/update-basic-info';
import { updateNotificationSettings } from '@user/controllers/update-settings';
import { checkAuthentication } from '@global/middlewares/auth-middleware';

const router: Router = express.Router();

router.get('/user/all/:page', checkAuthentication, getAllUsers);
router.get('/user/posts/:userId', checkAuthentication, getProfilePosts);
router.get('/user/profile', checkAuthentication, getUserProfile);
router.get('/user/profile/:userId', checkAuthentication, profileByUserId);
router.get('/user/search/:query', checkAuthentication, searchUser);
router.get('/user/user-suggestions', checkAuthentication, randomUserSuggestions);

router.put('/user/profile/change-password', checkAuthentication, changePassword);
router.put('/user/profile/basic-info', checkAuthentication, updateBasicInfo);
router.put('/user/profile/social-links', checkAuthentication, updateSocialLinks);
router.put('/user/profile/settings', checkAuthentication, updateNotificationSettings);

export const userRoutes: Router = router;

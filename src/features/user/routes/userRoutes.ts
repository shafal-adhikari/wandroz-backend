import express, { Router } from 'express';
import { getAllUsers, getUserProfile, profileByUserId } from '@user/controllers/get-profile';
import { searchUser } from '@user/controllers/search-user';
import { changePassword } from '@user/controllers/change-password';
import { updateBasicInfo, updateSocialLinks } from '@user/controllers/update-basic-info';
import { updateNotificationSettings } from '@user/controllers/update-settings';
import { checkAuthentication } from '@global/middlewares/auth-middleware';

const router: Router = express.Router();

router.get('/user/all/:page', checkAuthentication, getAllUsers);
router.get('/user/profile', checkAuthentication, getUserProfile);
router.get('/user/profile/:userId', checkAuthentication, profileByUserId);
router.get('/user/profile/search/:query', checkAuthentication, searchUser);

router.put('/user/profile/change-password', checkAuthentication, changePassword);
router.put('/user/profile/basic-info', checkAuthentication, updateBasicInfo);
router.put('/user/profile/social-links', checkAuthentication, updateSocialLinks);
router.put('/user/profile/settings', checkAuthentication, updateNotificationSettings);

export const userRoutes: Router = router;

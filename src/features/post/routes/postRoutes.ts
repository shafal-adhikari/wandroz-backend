import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { Router } from 'express';

const router = Router();

router.get('/post/all/:page', checkAuthentication, Get.prototype.posts);
router.get('/post/images/:page', checkAuthentication, Get.prototype.postsWithImages);
router.get('/post/videos/:page', checkAuthentication, Get.prototype.postsWithVideos);

router.post('/post', checkAuthentication, Create.prototype.post);
router.post('/post/image/post', checkAuthentication, Create.prototype.postWithImage);
router.post('/post/video/post', checkAuthentication, Create.prototype.postWithVideo);

router.put('/post/:postId', checkAuthentication, Update.prototype.posts);
router.put('/post/image/:postId', checkAuthentication, Update.prototype.postWithImage);
router.put('/post/video/:postId', checkAuthentication, Update.prototype.postWithVideo);

router.delete('/post/:postId', checkAuthentication, Delete.prototype.post);

export const postRoutes = router;

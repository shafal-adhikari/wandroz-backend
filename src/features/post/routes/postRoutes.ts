import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { createPost, createPostWithImage, createPostWithVideo } from '@post/controllers/create-post';
import { deletePost } from '@post/controllers/delete-post';
import { getPosts, getPostsWithImages, getPostsWithVideos } from '@post/controllers/get-posts';
import { updatePostWithImage, updatePostWithVideo, updatePosts } from '@post/controllers/update-post';
import { Router } from 'express';

const router = Router();

router.get('/post/all/:page', checkAuthentication, getPosts);
router.get('/post/images/:page', checkAuthentication, getPostsWithImages);
router.get('/post/videos/:page', checkAuthentication, getPostsWithVideos);

router.post('/post', checkAuthentication, createPost);
router.post('/post/image/post', checkAuthentication, createPostWithImage);
router.post('/post/video/post', checkAuthentication, createPostWithVideo);

router.put('/post/:postId', checkAuthentication, updatePosts);
router.put('/post/image/:postId', checkAuthentication, updatePostWithImage);
router.put('/post/video/:postId', checkAuthentication, updatePostWithVideo);

router.delete('/post/:postId', checkAuthentication, deletePost);

export const postRoutes = router;

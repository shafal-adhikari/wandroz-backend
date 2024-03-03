import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { createPost } from '@post/controllers/create-post';
import { deletePost } from '@post/controllers/delete-post';
import { getPosts } from '@post/controllers/get-posts';
import { updatePosts } from '@post/controllers/update-post';
import { Router } from 'express';

const router = Router();

router.get('/post/all/:page', checkAuthentication, getPosts);

router.post('/post', checkAuthentication, createPost);

router.put('/post/:postId', checkAuthentication, updatePosts);

router.delete('/post/:postId', checkAuthentication, deletePost);

export const postRoutes = router;

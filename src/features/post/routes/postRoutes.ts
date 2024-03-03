import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { createPost } from '@post/controllers/create-post';
import { deletePost } from '@post/controllers/delete-post';
import { getPostById, getPosts } from '@post/controllers/get-posts';
import { updatePosts } from '@post/controllers/update-post';
import { Router } from 'express';

const router = Router();

router.get('/post/all/:page', checkAuthentication, getPosts);

router.post('/post', checkAuthentication, createPost);
router.put('/post/:postId', checkAuthentication, updatePosts);
router.delete('/post/:postId', checkAuthentication, deletePost);
router.get('/post/:id', checkAuthentication, getPostById);
export const postRoutes = router;

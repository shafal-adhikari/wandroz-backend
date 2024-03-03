import { addComment } from '@comment/controllers/add-comment';
import { getComments, getCommentsNames, getSingleComment } from '@comment/controllers/get-comments';
import { checkAuthentication } from '@global/middlewares/auth-middleware';
import express from 'express';

const router = express.Router();

router.get('/post/comments/:postId', checkAuthentication, getComments);
router.get('/post/commentsnames/:postId', checkAuthentication, getCommentsNames);
router.get('/post/single/comment/:postId/:commentId', checkAuthentication, getSingleComment);

router.post('/post/comment', checkAuthentication, addComment);

export const commentRoutes = router;

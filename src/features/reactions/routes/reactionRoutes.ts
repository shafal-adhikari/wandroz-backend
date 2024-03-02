import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { addReaction } from '@reactions/controllers/add-reaction';
import { removeReaction } from '@reactions/controllers/remove-reaction';
import { Router } from 'express';

const router = Router();

router.post('/post/reaction', checkAuthentication, addReaction);
router.post('/post/reaction/remove', checkAuthentication, removeReaction);

export const reactionRoutes = router;

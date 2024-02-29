import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { addReaction } from '@reactions/controllers/add-reactions';
import { Router } from 'express';

const router = Router();
// router.get('/post/reactions/:postId', checkAuthentication, Get.prototype.reactions);
// router.get('/post/single/reaction/username/:username/:postId', checkAuthentication, Get.prototype.singleReactionByUsername);
// router.get('/post/reactions/username/:username', checkAuthentication, Get.prototype.reactionsByUsername);
router.post('/post/reaction', checkAuthentication, addReaction);
// router.delete('/post/reaction/:postId/:previousReaction/:postReactions', checkAuthentication, Remove.prototype.reaction);

export const reactionRoutes = router;

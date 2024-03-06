import { addMessage } from '@chat/controllers/add-message';
import { getMessages } from '@chat/controllers/get-messages';
import { seenMessage } from '@chat/controllers/message-seen';
import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { Router } from 'express';

const router = Router();

router.post('/add', checkAuthentication, addMessage);
router.get('/messages/:userId', checkAuthentication, getMessages);
router.put('/messages', checkAuthentication, seenMessage);

export { router as chatRoutes };

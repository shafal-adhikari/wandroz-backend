import { addMessage } from '@chat/controllers/add-message';
import { getChatList } from '@chat/controllers/get-chat-list';
import { getMessages } from '@chat/controllers/get-messages';
import { seenMessage } from '@chat/controllers/message-seen';
import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { Router } from 'express';

const router = Router();

router.post('/chat/add', checkAuthentication, addMessage);
router.get('/chat/messages/:userId', checkAuthentication, getMessages);
router.put('/chat/messages', checkAuthentication, seenMessage);
router.get('/chat/list', checkAuthentication, getChatList);

export { router as chatRoutes };

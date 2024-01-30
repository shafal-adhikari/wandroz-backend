import { Router } from 'express';
import { currentUser } from '@auth/controllers/current-user';
import { checkAuthentication } from '@global/middlewares/auth-middleware';

const router = Router();

router.get('/currentuser', checkAuthentication, currentUser);

export const currentUserRoutes = router;

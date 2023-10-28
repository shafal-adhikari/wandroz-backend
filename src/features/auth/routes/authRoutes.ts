import { Router } from 'express';
import { signUp } from '@auth/controllers/signup';
import { signIn } from '@auth/controllers/signin';
import { signout } from '@auth/controllers/signout';

const router = Router();

router.post('/signup', signUp);
router.post('/login', signIn);

router.get('/logout', signout);

export { router as authRouter };

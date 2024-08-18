import { Router } from 'express';
import { signUp, verifyAndCreateUser } from '@auth/controllers/signup';
import { signIn } from '@auth/controllers/signin';
import { signout } from '@auth/controllers/signout';
import { createResetPasswordToken, resetPassword } from '@auth/controllers/password';

const router = Router();

router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/forgot-password', createResetPasswordToken);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-user/:token', verifyAndCreateUser);
router.get('/logout', signout);

export { router as authRouter };

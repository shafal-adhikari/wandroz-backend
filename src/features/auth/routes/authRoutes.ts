import { Router } from 'express';
import { create } from '../controllers/signup';

const router = Router();

router.post('/signup', create);

export { router as authRouter };

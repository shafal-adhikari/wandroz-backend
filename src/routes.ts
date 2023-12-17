import { Application } from 'express';
import { authRouter } from './features/auth/routes/authRoutes';
import { serverAdapter } from '@service/queues/createQueue';
import { currentUserRouter } from '@auth/routes/currentRoutes';
import { verifyUser } from '@global/middlewares/auth-middleware';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  app.use('/queues', serverAdapter.getRouter());
  app.use(BASE_PATH, authRouter);
  app.use(BASE_PATH, verifyUser, currentUserRouter);
  app.use(BASE_PATH, verifyUser, userRouter);
};

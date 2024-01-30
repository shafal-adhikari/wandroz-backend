import { Application } from 'express';
import { authRouter } from './features/auth/routes/authRoutes';
import { serverAdapter } from '@service/queues/createQueue';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { verifyUser } from '@global/middlewares/auth-middleware';
import { userRoutes } from '@user/routes/userRoutes';
import { imageRoutes } from '@image/routes/imageRoutes';
import { postRoutes } from '@post/routes/postRoutes';
import { followerRoutes } from '@follower/routes/followerRoutes';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  app.use('/queues', serverAdapter.getRouter());
  app.use(BASE_PATH, authRouter);
  app.use(BASE_PATH, verifyUser, currentUserRoutes);
  app.use(BASE_PATH, verifyUser, userRoutes);
  app.use(BASE_PATH, verifyUser, imageRoutes);
  app.use(BASE_PATH, verifyUser, postRoutes);
  app.use(BASE_PATH, verifyUser, followerRoutes);
};

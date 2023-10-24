import { Application } from 'express';
import { authRouter } from './features/auth/routes/authRoutes';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  app.use(BASE_PATH, authRouter);
};

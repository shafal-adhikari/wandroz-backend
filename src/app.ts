import { createAdapter } from '@socket.io/redis-adapter';
import compression from 'compression';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express, { NextFunction, Request, Response, json, urlencoded } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import routes from './routes';
import { Server } from 'socket.io';
import { cloudinaryConfig, config, validateConfig } from './config';
import databseConnection from './setupDatabase';
import { CustomError, IErrorResponse, NotFoundError } from './shared/globals/helpers/error-handler';
import { redisClient } from '@service/redis/redisClient';
import { handleSocketIoConnection } from '@socket/socket';
import rateLimit from 'express-rate-limit';
const app = express();
app.set('trust proxy', true);
app.use(
  cookieSession({
    name: 'session',
    keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
    maxAge: 24 * 3600000,
    secure: config.NODE_ENV !== 'development'
  })
);

const customLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      error: 'You have exceeded the request limit! Please try again later.'
    });
  }
});
app.use(customLimiter);

// To protect against HTTP Parameter Pollution
app.use(hpp());

//Safe and Secure headers to prevent against clickjacking, xss and other injections
app.use(helmet());

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

app.use(compression());
app.use(json({ limit: '50mb' }));
app.use(
  urlencoded({
    extended: true,
    limit: '50mb'
  })
);
routes(app);
app.use('*', () => {
  throw new NotFoundError();
});
app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json(error.serializedErrors());
  }
  next();
});
validateConfig();
cloudinaryConfig();
databseConnection();
const httpServer = new http.Server(app);
const SERVER_PORT = 5500;
console.log(`Server has started with pid ${process.pid}`);
httpServer.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});
handleSocketIoConnection(io);
io.adapter(createAdapter(redisClient, redisClient.duplicate()));
export { io as socketIo };

import { AuthPayload } from '@auth/interfaces/auth.interface';
import { Server, Socket } from 'socket.io';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { ITyping } from '@chat/interfaces/chat.interface';
interface CustomSocket extends Socket {
  data: {
    user: AuthPayload;
  };
}

export const handleSocketIoConnection = (socketIo: Server) => {
  socketIo.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new NotAuthorizedError());
    }
    try {
      const payload: AuthPayload = JWT.verify(token ?? '', config.JWT_TOKEN) as AuthPayload;
      const currentUser = payload;
      socket.data.user = currentUser;
      await socket.join(currentUser.userId);
      console.log(socket.rooms);
      next();
    } catch (error) {
      console.log(error);
      return next(new NotAuthorizedError());
    }
  });
  socketIo.on('disconnect', () => {
    console.log('disconnected');
  });
  socketIo.on('connection', (socket: CustomSocket) => {
    socket.on('typing', (data: ITyping) => {
      console.log('typing ', data);
      socketIo.to(data.receiver).emit('typing', data);
    });
  });
};

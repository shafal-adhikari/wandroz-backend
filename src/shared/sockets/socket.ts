import { AuthPayload } from '@auth/interfaces/auth.interface';
import { socketIo } from '@root/app';
import { Socket } from 'socket.io';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { ITyping } from '@chat/interfaces/chat.interface';
interface CustomSocket extends Socket {
  data: {
    user: AuthPayload;
  };
}
socketIo.use((socket: CustomSocket, next) => {
  const token = socket.handshake.headers.authorization;
  if (!token) {
    throw new NotAuthorizedError();
  }
  try {
    const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN) as AuthPayload;
    const currentUser = payload;
    socket.data.user = currentUser;
    socket.join(currentUser.userId);
  } catch (error) {
    throw new NotAuthorizedError();
  }

  next();
});

socketIo.on('connection', (socket: CustomSocket) => {
  socket.on('typing', (data: ITyping) => {
    socketIo.to(data.receiver).emit('typing', data);
  });
});

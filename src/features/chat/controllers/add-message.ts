import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { addChatMessage } from '@service/db/chat.service';
import { socketIo } from '@root/app';

export async function addMessage(req: Request, res: Response): Promise<void> {
  const { receiverId, body, isRead } = req.body;
  const messageObjectId: ObjectId = new ObjectId();

  const messageData: IMessageData = {
    _id: `${messageObjectId}`,
    receiverId,
    senderId: `${req.currentUser!.userId}`,
    body,
    isRead,
    createdAt: new Date()
  };
  await addChatMessage(messageData);
  socketIo.to(receiverId).emit('message', messageData);
  res.status(HTTP_STATUS.OK).json({ message: 'Message added' });
}

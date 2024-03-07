import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { getChatMessages } from '@service/db/chat.service';
import mongoose from 'mongoose';

export async function getMessages(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const senderObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
  const messages = await getChatMessages(userObjectId, senderObjectId);

  res.status(HTTP_STATUS.OK).json({ message: 'messages', messages });
}

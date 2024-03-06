import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { messageSeen } from '@service/db/chat.service';
import mongoose from 'mongoose';

export async function seenMessage(req: Request, res: Response): Promise<void> {
  const { senderId } = req.body;
  const senderObjectId = new mongoose.Types.ObjectId(senderId);
  const receiverObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
  await messageSeen(senderObjectId, receiverObjectId);

  res.status(HTTP_STATUS.OK).json({ message: 'Message seen updated' });
}

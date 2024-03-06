import mongoose, { Model, model, Schema } from 'mongoose';
import { IMessageDocument } from '@chat/interfaces/chat.interface';

const messageSchema: Schema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  body: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema, 'Message');
export { MessageModel };

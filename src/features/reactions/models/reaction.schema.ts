import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import mongoose, { model, Model, Schema } from 'mongoose';

const reactionSchema: Schema = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true },
  type: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now() }
});

const ReactionModel: Model<IReactionDocument> = model<IReactionDocument>('Reaction', reactionSchema, 'Reaction');

export { ReactionModel };

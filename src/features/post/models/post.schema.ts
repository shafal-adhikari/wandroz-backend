import mongoose, { model, Model, Schema } from 'mongoose';
import { IPostDocument } from '@post/interfaces/post.interface';

const postSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  email: { type: String },
  post: { type: String, default: '' },
  images: [{ imgId: { type: String, default: '' }, imgVersion: { type: String, default: '' } }],
  videos: [{ imgId: { type: String, default: '' }, imgVersion: { type: String, default: '' } }],
  feelings: { type: String, default: '' },
  privacy: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const PostModel: Model<IPostDocument> = model<IPostDocument>('Post', postSchema, 'Post');

export { PostModel };

import { AccountPrivacy, IUserDocument } from '@user/interfaces/user.interface';
import mongoose, { model, Model, Schema } from 'mongoose';

const userSchema: Schema = new Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
  firstName: { type: String },
  lastName: { type: String },
  profilePicture: { type: String, default: '' },
  privacy: { type: String, enum: Object.keys(AccountPrivacy), default: AccountPrivacy.PUBLIC },
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Number },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: {
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  isVerified: { type: Boolean },
  work: { type: String, default: '' },
  school: { type: String, default: '' },
  location: { type: String, default: '' },
  quote: { type: String, default: '' },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' }
});

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');
export { UserModel };

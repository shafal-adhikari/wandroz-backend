import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';

export const getAuthUserByUsernameOrEmail = async (username: string, email: string): Promise<IAuthDocument> => {
  const query = {
    $or: [{ username: username }, { email: email }]
  };
  const user = (await AuthModel.findOne(query).exec()) as IAuthDocument;
  return user;
};

export const createAuthUser = async (data: IAuthDocument): Promise<void> => {
  await AuthModel.create(data);
};

export const getAuthUserByUsername = async (username: string): Promise<IAuthDocument> => {
  const user = (await AuthModel.findOne({ $or: [{ username: username }, { email: username }] }).exec()) as IAuthDocument;
  return user;
};

export const updatePasswordToken = async (authId: string, token: string, tokenExpiration: number) => {
  await AuthModel.updateOne(
    { _id: authId },
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    }
  );
};

export const getAuthUserByPasswordToken = async (token: string) => {
  const user = (await AuthModel.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  }).exec()) as IAuthDocument;
  return user;
};

import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';

export const getAuthUserByEmail = async (email: string): Promise<IAuthDocument> => {
  const query = {
    $or: [{ email: email }]
  };
  const user = (await AuthModel.findOne(query).exec()) as IAuthDocument;
  return user;
};

export const getAuthUserById = async (id: string): Promise<IAuthDocument> => {
  const user = (await AuthModel.findOne({ _id: id }).exec()) as IAuthDocument;
  return user;
};

export const createAuthUser = async (data: IAuthDocument): Promise<void> => {
  try {
    await AuthModel.create(data);
  } catch (error) {
    console.log(error);
  }
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

export const updateVerifyToken = async (authId: string, token: string, tokenExpiration: number) => {
  await AuthModel.updateOne(
    { _id: authId },
    {
      verifyToken: token,
      verifyTokenExpires: tokenExpiration
    }
  );
};
export const updateVerifiedStatus = async (authId: string) => {
  await AuthModel.updateOne({ _id: authId }, { isVerified: true });
};

export const getAuthUserByPasswordToken = async (token: string) => {
  const user = (await AuthModel.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  }).exec()) as IAuthDocument;
  return user;
};

export const getAuthUserByVerifyToken = async (token: string) => {
  const user = (await AuthModel.findOne({
    verifyToken: token,
    verifyTokenExpires: { $gt: Date.now() }
  }).exec()) as IAuthDocument;
  return user;
};

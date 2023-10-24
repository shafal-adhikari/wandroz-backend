import { IAuthDocument } from '../../../features/auth/interfaces/auth.interface';
import { AuthModel } from '../../../features/auth/models/auth.schema';

export const getUserByUsernameOrEmail = async (username: string, email: string): Promise<IAuthDocument> => {
  const query = {
    $or: [{ username: username }, { email: email }]
  };
  const user = (await AuthModel.findOne(query).exec()) as IAuthDocument;
  return user;
};

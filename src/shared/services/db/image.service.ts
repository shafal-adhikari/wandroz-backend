import { ImageModel } from '@image/models/image.schema';
import { UserModel } from '@user/models/user.schema';

const addImage = async (userId: string, imgId: string, imgVersion: string, type: string): Promise<void> => {
  await ImageModel.create({
    userId,
    bgImageVersion: type === 'background' ? imgVersion : '',
    bgImageId: type === 'background' ? imgId : '',
    imgVersion,
    imgId
  });
};
export const addUserProfileImageToDB = async (userId: string, url: string, imgId: string, imgVersion: string): Promise<void> => {
  await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
  await addImage(userId, imgId, imgVersion, 'profile');
};

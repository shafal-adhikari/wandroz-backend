import { IFileImageDocument } from '@image/interfaces/image.interface';
import { ImageModel } from '@image/models/image.schema';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

export const addImage = async (userId: string, imgId: string, imgVersion: string, type: string): Promise<void> => {
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
export const addBackgroundImageToDB = async (userId: string, imgId: string, imgVersion: string): Promise<void> => {
  await UserModel.updateOne({ _id: userId }, { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }).exec();
  await addImage(userId, imgId, imgVersion, 'background');
};

export const removeImageFromDB = async (imageId: string): Promise<void> => {
  await ImageModel.deleteOne({ _id: imageId }).exec();
};

export const getImageByBackgroundId = async (bgImageId: string): Promise<IFileImageDocument> => {
  const image: IFileImageDocument = (await ImageModel.findOne({ bgImageId }).exec()) as IFileImageDocument;
  return image;
};

export const getImages = async (userId: string): Promise<IFileImageDocument[]> => {
  const images: IFileImageDocument[] = await ImageModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }]);
  return images;
};

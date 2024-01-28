import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { isDataURL } from '@global/helpers/helpers';
import { joiValidation } from '@global/validations/joiValidations';
import { IBgUploadResponse } from '@image/interfaces/image.interface';
import { addImageSchema } from '@image/schemes/image.schema';
import { config } from '@root/config';
import { addImageJob } from '@service/queues/image.queue';
import { updateSingleUserItemInCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export const addProfileImage = joiValidation(addImageSchema)(async (req: Request, res: Response): Promise<void> => {
  const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser!.userId, true, true)) as UploadApiResponse;
  if (!result?.public_id) {
    throw new BadRequestError('File upload: Error occurred. Try again.');
  }
  const url = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
  await updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'profilePicture', url);
  addImageJob('addUserProfileImageToDB', {
    key: `${req.currentUser!.userId}`,
    value: url,
    imgId: result.public_id,
    imgVersion: result.version.toString()
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
});

export const addBackgroundImage = joiValidation(addImageSchema)(async (req: Request, res: Response): Promise<void> => {
  const { version, publicId }: IBgUploadResponse = await backgroundUpload(req.body.image);
  const bgImageId: Promise<IUserDocument> = updateSingleUserItemInCache(
    `${req.currentUser!.userId}`,
    'bgImageId',
    publicId
  ) as Promise<IUserDocument>;
  const bgImageVersion: Promise<IUserDocument> = updateSingleUserItemInCache(
    `${req.currentUser!.userId}`,
    'bgImageVersion',
    version
  ) as Promise<IUserDocument>;
  await Promise.all([bgImageId, bgImageVersion]);
  addImageJob('updateBGImageInDB', {
    key: `${req.currentUser!.userId}`,
    imgId: publicId,
    imgVersion: version.toString()
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
});

const backgroundUpload = async (image: string): Promise<IBgUploadResponse> => {
  const isURL = isDataURL(image);
  let version = '';
  let publicId = '';
  if (isURL) {
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError(result.message);
    } else {
      version = result.version.toString();
      publicId = result.public_id;
    }
  } else {
    const value = image.split('/');
    version = value[value.length - 2];
    publicId = value[value.length - 1];
  }
  return { version: version.replace(/v/g, ''), publicId };
};

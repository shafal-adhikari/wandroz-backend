import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { joiValidation } from '@global/validations/joiValidations';
import { addImageSchema } from '@image/schemes/image.schema';
import { addImageJob } from '@service/queues/image.queue';
import { updateSingleUserItemInCache } from '@service/redis/user.cache';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export const addProfileImage = joiValidation(addImageSchema)(async (req: Request, res: Response): Promise<void> => {
  const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser!.userId, true, true)) as UploadApiResponse;
  if (!result?.public_id) {
    throw new BadRequestError('File upload: Error occurred. Try again.');
  }
  const url = `https://res.cloudinary.com/dyamr9ym3/image/upload/v${result.version}/${result.public_id}`;
  await updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'profilePicture', url);
  addImageJob('addUserProfileImageToDB', {
    key: `${req.currentUser!.userId}`,
    value: url,
    imgId: result.public_id,
    imgVersion: result.version.toString()
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
});

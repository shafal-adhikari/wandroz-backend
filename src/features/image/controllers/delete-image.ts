import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFileImageDocument } from '@image/interfaces/image.interface';
import { addImageJob } from '@service/queues/image.queue';
import * as imageService from '@service/db/image.service';
import { updateSingleUserItemInCache } from '@service/redis/user.cache';

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.params;
  addImageJob('removeImageFromDB', {
    imageId
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
};

export const deleteBackgroundImage = async (req: Request, res: Response): Promise<void> => {
  const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);
  const bgImageId: Promise<IUserDocument> = updateSingleUserItemInCache(
    `${req.currentUser!.userId}`,
    'bgImageId',
    ''
  ) as Promise<IUserDocument>;
  const bgImageVersion: Promise<IUserDocument> = updateSingleUserItemInCache(
    `${req.currentUser!.userId}`,
    'bgImageVersion',
    ''
  ) as Promise<IUserDocument>;
  (await Promise.all([bgImageId, bgImageVersion])) as [IUserDocument, IUserDocument];
  addImageJob('removeImageFromDB', {
    imageId: image?._id
  });
  res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
};

import { IFileImageDocument } from '@image/interfaces/image.interface';
import * as imageService from '@service/db/image.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export const getImages = async (req: Request, res: Response): Promise<void> => {
  const images: IFileImageDocument[] = await imageService.getImages(req.params.userId);
  res.status(HTTP_STATUS.OK).json({ message: 'User images', images });
};

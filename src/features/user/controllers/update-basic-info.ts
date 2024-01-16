import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { updateSingleUserItemInCache } from '@service/redis/user.cache';
import { addUserJob } from '@service/queues/user.queue';
import { basicInfoSchema, socialLinksSchema } from '@user/schemas/info';
import { joiValidation } from '@global/validations/joiValidations';

export const updateBasicInfo: (req: Request, res: Response) => Promise<void> = joiValidation(basicInfoSchema)(async (
  req: Request,
  res: Response
) => {
  for (const [key, value] of Object.entries(req.body)) {
    await updateSingleUserItemInCache(req.currentUser!.userId, key, `${value}`);
  }

  addUserJob('updateBasicInfoInDB', {
    key: req.currentUser!.userId,
    value: req.body
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
});

export const updateSocialLinks: (req: Request, res: Response) => Promise<void> = joiValidation(socialLinksSchema)(async (
  req: Request,
  res: Response
) => {
  await updateSingleUserItemInCache(req.currentUser!.userId, 'social', req.body);

  addUserJob('updateSocialLinksInDB', {
    key: req.currentUser!.userId,
    value: req.body
  });

  res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
});

import { ObjectId } from 'mongodb';
import { joiValidation } from '../../../shared/globals/validations/joiValidations';
import { signupSchema } from '../schemes/signup';
import { Request, Response } from 'express';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { getUserByUsernameOrEmail } from '../../../shared/services/db/auth.service';
import { BadRequestError } from '../../../shared/globals/helpers/error-handler';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '../../../shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';
export const create = joiValidation(signupSchema)(async (req: Request, res: Response) => {
  const { username, email, password, avatarColor, avatarImage } = req.body;
  const checkIfUserExist: IAuthDocument = await getUserByUsernameOrEmail(username, email.toLowerCase());
  if (checkIfUserExist) {
    throw new BadRequestError('User already exists');
  }
  const authObjectId: ObjectId = new ObjectId();
  const userObjectId: ObjectId = new ObjectId();
  const uId = authObjectId.toString();
  const authData: IAuthDocument = signUpData({
    _id: authObjectId,
    uId,
    username,
    email,
    password,
    avatarColor
  });
  const result = (await uploads(avatarImage, userObjectId.toString(), true, true)) as UploadApiResponse;
  if (!result.public_id) {
    throw new BadRequestError('Error uploading file. Please try again');
  }
  res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', authData });
});

const signUpData = (data: ISignUpData): IAuthDocument => {
  const { _id, username, email, uId, password, avatarColor } = data;
  return {
    _id,
    uId,
    username,
    email: email.toLowerCase(),
    password,
    avatarColor,
    createdAt: new Date()
  } as IAuthDocument;
};

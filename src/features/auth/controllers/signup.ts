import { ObjectId } from 'mongodb';
import { joiValidation } from '@root/shared/globals/validations/joiValidations';
import { signupSchema } from '../schemes/signup';
import { Request, Response } from 'express';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { getUserByUsernameOrEmail } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@root/shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { config } from '@root/config';
import { saveUserToCache } from '@service/redis/user.cache';
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
  const userDataToSave: IUserDocument = userData(authData, userObjectId);
  userDataToSave.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
  await saveUserToCache(`${userObjectId}`, uId, userDataToSave);
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

const userData = (data: IAuthDocument, userObjectId: ObjectId): IUserDocument => {
  const { _id, username, password, email, uId, avatarColor } = data;
  return {
    _id: userObjectId,
    authId: _id,
    username,
    password,
    email,
    uId,
    avatarColor,
    profilePicture: '',
    blocked: [],
    blockedBy: [],
    work: '',
    location: '',
    school: '',
    quote: '',
    bgImageId: '',
    bgImageVersion: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    notifications: {
      messages: false,
      reactions: false,
      comments: false,
      follows: false
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  } as unknown as IUserDocument;
};

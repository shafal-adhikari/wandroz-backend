import { ObjectId } from 'mongodb';
import { joiValidation } from '@root/shared/globals/validations/joiValidations';
import { signupSchema } from '../schemes/signup';
import { Request, Response } from 'express';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { getAuthUserByUsernameOrEmail } from '@root/shared/services/db/auth.service';
import { BadRequestError } from '@root/shared/globals/helpers/error-handler';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@root/shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interfaces/user.interface';
import { config } from '@root/config';
import { saveUserToCache } from '@service/redis/user.cache';
import { omit } from 'lodash';
import { addAuthUserJob } from '@service/queues/auth.queue';
import { addUserJob } from '@service/queues/user.queue';
import JWT from 'jsonwebtoken';
import { generateRandomIntegers } from '@global/helpers/helpers';
export const signUp = joiValidation(signupSchema)(async (req: Request, res: Response) => {
  const { username, email, password, avatarImage } = req.body;
  const checkIfUserExist: IAuthDocument = await getAuthUserByUsernameOrEmail(username, email.toLowerCase());
  if (checkIfUserExist) {
    throw new BadRequestError('User already exists');
  }
  const authObjectId: ObjectId = new ObjectId();
  const userObjectId: ObjectId = new ObjectId();
  const uId = generateRandomIntegers(10).toString();
  const authData: IAuthDocument = signUpData({
    _id: authObjectId,
    uId,
    username,
    email,
    password
  });
  const userDataToSave: IUserDocument = userData(authData, userObjectId);

  if (avatarImage) {
    const result = (await uploads(avatarImage, userObjectId.toString(), true, true)) as UploadApiResponse;

    if (!result.public_id) {
      throw new BadRequestError('Error uploading file. Please try again');
    }
    userDataToSave.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
  }
  await saveUserToCache(`${userObjectId}`, uId, userDataToSave);
  omit(userDataToSave, ['uId', 'username', 'email', 'password']);
  addAuthUserJob('addAuthUserToDB', { value: authData });
  addUserJob('addAuthUserToDB', { value: userDataToSave });
  const jwtToken = generateSignUpToken(authData, userObjectId);
  req.session = { jwt: jwtToken };
  res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', user: userDataToSave, token: jwtToken });
});

const generateSignUpToken = (data: IAuthDocument, userObjectId: ObjectId): string => {
  return JWT.sign(
    {
      userId: userObjectId,
      uId: data.uId,
      email: data.email,
      username: data.username
    },
    config.JWT_TOKEN,
    {
      expiresIn: 24 * 3600000
    }
  );
};
const signUpData = (data: ISignUpData): IAuthDocument => {
  const { _id, username, email, uId, password } = data;
  return {
    _id,
    uId,
    username,
    email: email.toLowerCase(),
    password,
    createdAt: new Date()
  } as IAuthDocument;
};

const userData = (data: IAuthDocument, userObjectId: ObjectId): IUserDocument => {
  const { _id, username, password, email, uId } = data;
  return {
    _id: userObjectId.toString(),
    authId: _id.toString(),
    username,
    password,
    email,
    uId,
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

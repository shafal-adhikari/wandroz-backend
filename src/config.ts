import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({});

export const config = {
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/wandrooz-backend',
  JWT_TOKEN: process.env.JWT_TOKEN || '1234',
  NODE_ENV: process.env.NODE_ENV || '',
  SECRET_KEY_ONE: process.env.SECRET_KEY_ONE || '',
  SECRET_KEY_TWO: process.env.SECRET_KEY_TWO || '',
  CLIENT_URL: process.env.CLIENT_URL || '*',
  REDIS_HOST: process.env.REDIS_HOST || 'redis://localhost:6379',
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
  SENDER_EMAIL: process.env.SENDER_EMAIL || 'haskell.purdy89@ethereal.email',
  SENDER_EMAIL_PASSWORDs: process.env.SENDER_EMAIL_PASSWORD || 'f8aVyed7usAAf1hgET',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_SENDER: process.env.SENDGRID_SENDER
};

export const validateConfig = () => {
  for (const [key, value] of Object.entries(config)) {
    if (value == undefined) {
      throw new Error(`ENV for ${key} doesnt exist`);
    }
  }
};

export const cloudinaryConfig = () => {
  cloudinary.v2.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_API_SECRET
  });
};

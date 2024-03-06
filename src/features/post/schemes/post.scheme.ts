import Joi, { ObjectSchema } from 'joi';

const postSchema: ObjectSchema = Joi.object().keys({
  post: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  images: Joi.array().items(Joi.string().optional().allow(null, '')).optional().allow(null, ''),
  deletedImages: Joi.array().items(Joi.string()).optional().allow(null, ''),
  deletedVideos: Joi.array().items(Joi.string()).optional().allow(null, ''),
  videos: Joi.array()
    .items(
      Joi.string().required().messages({
        'any.required': 'Image is a required field',
        'string.empty': 'Image property is not allowed to be empty'
      })
    )
    .optional()
    .allow(null, '')
});

export { postSchema };

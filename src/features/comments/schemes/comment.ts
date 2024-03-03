import Joi, { ObjectSchema } from 'joi';

const addCommentSchema: ObjectSchema = Joi.object().keys({
  postId: Joi.string().required().messages({
    'any.required': 'postId is a required property'
  }),
  comment: Joi.string().required().messages({
    'any.required': 'comment is a required property'
  })
});

export { addCommentSchema };

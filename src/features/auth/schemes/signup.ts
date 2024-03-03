import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  firstName: Joi.string().required().min(3).max(16).messages({
    'string.base': 'First Name must be of type string',
    'string.min': 'Invalid first name',
    'string.max': 'Invalid first name',
    'string.empty': 'First name is a required field'
  }),
  lastName: Joi.string().min(3).required().max(16).messages({
    'string.base': 'Last Name must be of type string',
    'string.min': 'Invalid last name',
    'string.max': 'Invalid last name',
    'string.empty': 'Last name is a required field'
  }),
  password: Joi.string().required().min(4).max(16).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  })
});

export { signupSchema };

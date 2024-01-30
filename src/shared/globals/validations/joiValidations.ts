/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { ObjectSchema } from 'joi';
import { JoiRequestValidationError } from '../helpers/error-handler';

export const joiValidation = (schema: ObjectSchema) => {
  return function (handler: (...args: any[]) => Promise<any>) {
    return async function (...args: any[]) {
      const req: Request = args[0];
      const { error } = await Promise.resolve(schema.validate(req.body));
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return handler(...args);
    };
  };
};

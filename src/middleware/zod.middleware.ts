import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

import { HttpError } from '../errors/http-error';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      console.error('validation errors:', errors);
      throw new HttpError('Dati inseriti non validi', 400);
    }

    req.body = result.data; // dati sanificati
    next();
  };
};
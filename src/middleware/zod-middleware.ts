import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      console.log('validation errors:', errors);

      res.status(400).json({ message: 'Dati inseriti non validi'});
      return
    }

    req.body = result.data; // dati sanificati
    next();
  };
};
import { HttpException } from '@exceptions/HttpException';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';

const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
  const object = plainToInstance(type, req[value], { enableImplicitConversion: true });
  validate(object, { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => {
            if (error.constraints) {
              return Object.values(error.constraints).join(', ');
            }
            // Si hay hijos, busca los mensajes en los hijos
            if (error.children && error.children.length > 0) {
              return error.children
                .map(child => child.constraints ? Object.values(child.constraints).join(', ') : '')
                .filter(Boolean)
                .join(', ');
            }
            return '';
          })
          .filter(Boolean)
          .join(', ');
        next(new HttpException(400, message || 'Validation error'));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;

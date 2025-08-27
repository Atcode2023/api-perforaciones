import { HttpException } from '../exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
declare const errorMiddleware: (error: HttpException, req: Request, res: Response, next: NextFunction) => void;
export default errorMiddleware;

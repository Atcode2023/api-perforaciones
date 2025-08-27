import { RequestWithUser } from '../interfaces/auth.interface';
import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Response } from 'express';
declare const asyncLocalStorage: AsyncLocalStorage<unknown>;
declare const authMiddleware: (req: RequestWithUser, _: Response, next: NextFunction) => Promise<void>;
export default authMiddleware;
export { asyncLocalStorage };

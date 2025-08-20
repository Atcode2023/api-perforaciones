import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '../models/user.model';
import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';

const asyncLocalStorage = new AsyncLocalStorage();

const authMiddleware = async (req: RequestWithUser, _: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        const user = {
          _id: findUser._id,
          username: findUser.username,
          role: findUser.role,
          password: findUser.password,
          created_at: findUser.created_at,
          deleted_at: findUser.deleted_at,
        };
        req.user = user;
        console.log(req.user, 'req.user');
        asyncLocalStorage.run({
          request: req,
          user: req.user,
        }, next);
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    console.log(error)
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
export { asyncLocalStorage };

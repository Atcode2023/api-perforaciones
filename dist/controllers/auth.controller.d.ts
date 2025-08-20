import { RequestWithUser } from '../interfaces/auth.interface';
import AuthService from '../services/auth.service';
import { NextFunction, Request, Response } from 'express';
declare class AuthController {
    authService: AuthService;
    logIn: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logOut: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
}
export default AuthController;

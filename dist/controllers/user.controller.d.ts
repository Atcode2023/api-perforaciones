import userService from '../services/user.service';
import { NextFunction, Request, Response } from 'express';
declare class UsersController {
    userService: userService;
    getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserRoleUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserRoleSupervisor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default UsersController;

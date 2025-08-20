import { IOptions, QueryResult } from '@/paginate/paginate';
import pick from '@/utils/pick';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/user.interface';
import userService from '@services/user.service';
import { NextFunction, Request, Response } from 'express';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = pick(req.query, ['search']);
      const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page']);
      const findAllUsersData: QueryResult = await this.userService.findAllUser(filter, options);

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const userData: CreateUserDto = req.body;
      const updateUserData: User = await this.userService.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getUserRoleUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users: User[] = await this.userService.getAllUserRoleUsers();
      res.status(200).json({ data: users, message: 'findUserRoleUsers' });
    } catch (error) {
      next(error);
    }
  };

  public getUserRoleSupervisor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users: User[] = await this.userService.getAllUserRoleSupervisor();
      res.status(200).json({ data: users, message: 'findUserRoleUsers' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;

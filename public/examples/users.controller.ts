import { IOptions, QueryResult } from '@/paginate/paginate';
import pick from '@/utils/pick';
import { BotPaymentUserDto, CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';
import { NextFunction, Request, Response } from 'express';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = pick(req.query, ['first_name', 'role', 'email']);
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

  public botPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentData: BotPaymentUserDto = req.body;
      const userId = req.body.user_id;

      const payment = await this.userService.botPayment(userId, paymentData);

      if (payment) {
        res.status(200).json({ success: true, message: 'Payment created' });
      } else {
        res.status(400).json({ message: 'Error creating payment' });
      }
    } catch (error) {
      next(error);
    }
  };

  public checkBotPaymentExpired = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const result = await this.userService.checkBotPaymentExpired(userId);
      res.status(200).json({ expired: result.expired });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;

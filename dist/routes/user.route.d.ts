import UsersController from '../controllers/user.controller';
import { Routes } from '../interfaces/routes.interface';
declare class UserRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    usersController: UsersController;
    constructor();
    private initializeRoutes;
}
export default UserRoute;

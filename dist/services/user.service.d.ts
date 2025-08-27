import { IOptions, QueryResult } from '../paginate/paginate';
import { CreateUserDto } from '../dtos/users.dto';
import { IUserModel, User } from '../models/user.model';
declare class UserService {
    users: IUserModel;
    findAllUser(filter: Record<string, any>, options: IOptions): Promise<QueryResult>;
    findUserById(userId: string): Promise<User>;
    createUser(userData: CreateUserDto): Promise<User>;
    updateUser(userId: string, userData: CreateUserDto): Promise<User>;
    deleteUser(userId: string): Promise<User>;
    getAllUserRoleUsers(): Promise<User[]>;
    getAllUserRoleSupervisor(): Promise<User[]>;
    updateUserLastSync(userId: string, userData: CreateUserDto): Promise<User>;
}
export default UserService;

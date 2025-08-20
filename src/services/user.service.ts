import { IOptions, QueryResult } from '@/paginate/paginate';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import userModel, { IUserModel, User } from '@models/user.model';
import { isEmpty } from '@utils/util';
import { hash } from 'bcrypt';

class UserService {
  public users: IUserModel = userModel;

  public async findAllUser(filter: Record<string, any>, options: IOptions): Promise<QueryResult> {
    let query: Record<string, any> = { deleted_at: null, role: { $ne: 'ADMIN' } };
    if (filter && filter.search) {
      query.username = { $regex: filter.search, $options: 'i' };
    }
    const users: QueryResult = await this.users.paginate(query, options);
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');

    const findUser: User = await this.users.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findOne({ username: userData.username });
    if (findUser) throw new HttpException(409, `This email ${userData.username} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    if (userData.username) {
      const findUser: User = await this.users.findOne({ username: userData.username });
      if (findUser && findUser._id != userId) throw new HttpException(409, `This email ${userData.username} already exists`);
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserById: User = await this.users.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUserById) throw new HttpException(409, "User doesn't exist");

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const user: User & { softDelete?: () => Promise<User> } = await this.users.findById(userId);
    if (!user) throw new HttpException(409, "User doesn't exist");
    await user.softDelete();
    return user;
  }

  public async getAllUserRoleUsers(): Promise<User[]> {
    const users: User[] = await this.users.find({ role: 'USER', deleted_at: null });
    return users;
  }
  
  public async getAllUserRoleSupervisor(): Promise<User[]> {
    const users: User[] = await this.users.find({ role: 'SUPERVISOR', deleted_at: null });
    return users;
  }

  public async updateUserLastSync(userId: string, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    
    const updateUserById: User = await this.users.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUserById) throw new HttpException(409, "User doesn't exist");

    return updateUserById;
  }
}

export default UserService;

import { SECRET_KEY } from '@config';
import { LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import userModel, { User } from '../models/user.model';
import { isEmpty } from '../utils/util';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

class AuthService {
  public users = userModel;

  public async login(userData: LoginUserDto): Promise<{ token: string; user: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    
    const findUser = await this.users.findOne({ username: userData.username }, { username: 1, role: 1, password: 1 });
    if (!findUser) throw new HttpException(409, `This username ${userData.username} was not found`);

    const isPasswordMatching = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');
    const user: User = findUser.toObject();
    delete user.password;
    const { token } = this.createToken(findUser);
    return { token, user };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: User = await this.users.findOne({ username: userData.username, password: userData.password });
    if (!findUser) throw new HttpException(409, `This username ${userData.username} was not found`);

    return findUser;
  }

  public createToken(user: User, expiresIn: string | number = 60 * 60): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }
}

export default AuthService;

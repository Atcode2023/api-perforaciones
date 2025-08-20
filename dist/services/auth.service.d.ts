import { LoginUserDto } from '@dtos/users.dto';
import { TokenData } from '@interfaces/auth.interface';
import { User } from '../models/user.model';
declare class AuthService {
    users: import("../models/user.model").IUserModel;
    login(userData: LoginUserDto): Promise<{
        token: string;
        user: User;
    }>;
    logout(userData: User): Promise<User>;
    createToken(user: User, expiresIn?: string | number): TokenData;
}
export default AuthService;

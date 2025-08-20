import { User } from '../models/user.model';
import { Request } from 'express';
export interface DataStoredInToken {
    _id: string;
}
export interface TokenData {
    token: string;
    expiresIn: string | number;
}
export interface RequestWithUser extends Request {
    user: User;
}

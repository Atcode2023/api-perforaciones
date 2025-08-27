import { QueryResult } from "../paginate/paginate";
import { Model } from "mongoose";
export interface User {
    _id?: any;
    username: string;
    password: string;
    role: string;
    created_at: Date;
    deleted_at: Date | null;
    last_sync: Date | null;
}
export interface IUserModel extends Model<User> {
    paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}
declare const userModel: IUserModel;
export default userModel;

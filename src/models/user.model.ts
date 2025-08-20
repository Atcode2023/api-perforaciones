import { paginate } from "../paginate";
import { QueryResult } from "../paginate/paginate";
import { Schema, model, Model } from "mongoose";

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

const userSchema: Schema = new Schema<User, IUserModel>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'USER',
    enum: ['ADMIN', 'USER', 'SUPERVISOR'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  last_sync: { type: Date, default: null },
});

userSchema.plugin(paginate);

userSchema.methods.softDelete = async function () {
  if (this.deleted_at) return this; // Ya eliminado
  await userModel.updateOne({ _id: this._id }, { $set: { deleted_at: new Date() } });
  this.deleted_at = new Date();
  
  return this;
};

const userModel = model<User, IUserModel>('User', userSchema);

export default userModel;
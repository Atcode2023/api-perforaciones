import { IOptions, QueryResult } from '@/paginate/paginate';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import userModel, { IUserModel, User } from '@models/users.model';
import { isEmpty } from '@utils/util';
import { hash } from 'bcrypt';
import { sendPaymentSuccessEmail, sendPaymentFailureEmail } from '@/mail/senders';

class UserService {
  public users: IUserModel = userModel;

  public async findAllUser(filter: Record<string, any>, options: IOptions): Promise<QueryResult> {
    const users: QueryResult = await this.users.paginate({ ...filter, deletedAt: null }, options);
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

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    if (userData.email) {
      const findUser: User = await this.users.findOne({ email: userData.email });
      if (findUser && findUser._id != userId) throw new HttpException(409, `This email ${userData.email} already exists`);
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
    if (typeof user.softDelete === 'function') {
      await user.softDelete();
    } else {
      throw new HttpException(500, 'Soft delete not implemented');
    }
    return user;
  }

  public async botPayment(userId: string, botPaymentData: any): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, 'userId is empty');

    const findUser: User = await this.users.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const paymentDate = new Date(); // Usar la fecha y hora actual
    const paymentExpiration = new Date(paymentDate.getTime() + 30 * 60000);

    const payment = {
      ...botPaymentData,
      payment_date: paymentDate.toISOString(), // Guardar la fecha actual como payment_date
      payment_expiration: paymentExpiration.toISOString(),
      status: botPaymentData.status == 'success' ? 'vigente' : 'expirated',
    };

    const updateUserById: User = await this.users.findByIdAndUpdate(userId, { $push: { bot_payments: payment } }, { new: true });
    if (!updateUserById) throw new HttpException(409, "User doesn't exist");

    if (botPaymentData.status == 'success') {
      sendPaymentSuccessEmail(findUser, botPaymentData);
    } else {
      sendPaymentFailureEmail(findUser, botPaymentData);
    }

    return updateUserById;
  }

  public async checkBotPaymentExpired(userId: string): Promise<{ expired: boolean }> {
    if (isEmpty(userId)) throw new HttpException(400, 'userId is empty');
    const user: User = await this.users.findById(userId);
    if (!user) throw new HttpException(404, 'User not found');
    let expired = true;
    if (user.bot_payments && user.bot_payments.length > 0) {
      const lastPayment = user.bot_payments[user.bot_payments.length - 1];
      const now = new Date();
      const expiration = new Date(lastPayment.payment_expiration);

      console.log(now);
      console.log(expiration);

      if (expiration < now) {
        await this.users.updateOne({ _id: user._id, 'bot_payments._id': lastPayment._id }, { $set: { 'bot_payments.$.status': 'expirated' } });
        lastPayment.status = 'expirated';
      } else {
        expired = false;
      }
    }
    return { expired };
  }
}

export default UserService;

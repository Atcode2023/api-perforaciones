"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("@exceptions/HttpException");
const user_model_1 = tslib_1.__importDefault(require("@models/user.model"));
const util_1 = require("@utils/util");
const bcrypt_1 = require("bcrypt");
class UserService {
    constructor() {
        this.users = user_model_1.default;
    }
    async findAllUser(filter, options) {
        let query = { deleted_at: null, role: { $ne: 'ADMIN' } };
        if (filter && filter.search) {
            query.username = { $regex: filter.search, $options: 'i' };
        }
        const users = await this.users.paginate(query, options);
        return users;
    }
    async findUserById(userId) {
        if ((0, util_1.isEmpty)(userId))
            throw new HttpException_1.HttpException(400, 'UserId is empty');
        const findUser = await this.users.findOne({ _id: userId });
        if (!findUser)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        return findUser;
    }
    async createUser(userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ username: userData.username });
        if (findUser)
            throw new HttpException_1.HttpException(409, `This email ${userData.username} already exists`);
        const hashedPassword = await (0, bcrypt_1.hash)(userData.password, 10);
        const createUserData = await this.users.create(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
        return createUserData;
    }
    async updateUser(userId, userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        if (userData.username) {
            const findUser = await this.users.findOne({ username: userData.username });
            if (findUser && findUser._id != userId)
                throw new HttpException_1.HttpException(409, `This email ${userData.username} already exists`);
        }
        if (userData.password) {
            const hashedPassword = await (0, bcrypt_1.hash)(userData.password, 10);
            userData = Object.assign(Object.assign({}, userData), { password: hashedPassword });
        }
        const updateUserById = await this.users.findByIdAndUpdate(userId, userData, { new: true });
        if (!updateUserById)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        return updateUserById;
    }
    async deleteUser(userId) {
        const user = await this.users.findById(userId);
        if (!user)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        await user.softDelete();
        return user;
    }
}
exports.default = UserService;
//# sourceMappingURL=user.service.js.map
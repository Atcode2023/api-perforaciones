"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _config_1 = require("../config");
const HttpException_1 = require("../exceptions/HttpException");
const user_model_1 = tslib_1.__importDefault(require("../models/user.model"));
const util_1 = require("../utils/util");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
class AuthService {
    constructor() {
        this.users = user_model_1.default;
    }
    async login(userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ username: userData.username }, { username: 1, role: 1, password: 1 });
        if (!findUser)
            throw new HttpException_1.HttpException(409, `This username ${userData.username} was not found`);
        const isPasswordMatching = await (0, bcrypt_1.compare)(userData.password, findUser.password);
        if (!isPasswordMatching)
            throw new HttpException_1.HttpException(409, 'Password is not matching');
        const user = findUser.toObject();
        delete user.password;
        const { token } = this.createToken(findUser);
        return { token, user };
    }
    async logout(userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ username: userData.username, password: userData.password });
        if (!findUser)
            throw new HttpException_1.HttpException(409, `This username ${userData.username} was not found`);
        return findUser;
    }
    createToken(user, expiresIn = 60 * 60) {
        const dataStoredInToken = { _id: user._id };
        const secretKey = _config_1.SECRET_KEY;
        return { expiresIn, token: (0, jsonwebtoken_1.sign)(dataStoredInToken, secretKey, { expiresIn }) };
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map
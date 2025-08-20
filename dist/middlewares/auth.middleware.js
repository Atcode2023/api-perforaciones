"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncLocalStorage = void 0;
const tslib_1 = require("tslib");
const _config_1 = require("@config");
const HttpException_1 = require("@exceptions/HttpException");
const user_model_1 = tslib_1.__importDefault(require("../models/user.model"));
const async_hooks_1 = require("async_hooks");
const jsonwebtoken_1 = require("jsonwebtoken");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
exports.asyncLocalStorage = asyncLocalStorage;
const authMiddleware = async (req, _, next) => {
    try {
        const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
        if (Authorization) {
            const secretKey = _config_1.SECRET_KEY;
            const verificationResponse = (await (0, jsonwebtoken_1.verify)(Authorization, secretKey));
            const userId = verificationResponse._id;
            const findUser = await user_model_1.default.findById(userId);
            if (findUser) {
                const user = {
                    _id: findUser._id,
                    username: findUser.username,
                    role: findUser.role,
                    password: findUser.password,
                    created_at: findUser.created_at,
                    deleted_at: findUser.deleted_at,
                };
                req.user = user;
                console.log(req.user, 'req.user');
                asyncLocalStorage.run({
                    request: req,
                    user: req.user,
                }, next);
            }
            else {
                next(new HttpException_1.HttpException(401, 'Wrong authentication token'));
            }
        }
        else {
            next(new HttpException_1.HttpException(404, 'Authentication token missing'));
        }
    }
    catch (error) {
        console.log(error);
        next(new HttpException_1.HttpException(401, 'Wrong authentication token'));
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map
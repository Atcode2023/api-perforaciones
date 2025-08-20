"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const user_controller_1 = tslib_1.__importDefault(require("@controllers/user.controller"));
const users_dto_1 = require("@dtos/users.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("@middlewares/validation.middleware"));
class UserRoute {
    constructor() {
        this.path = '/users';
        this.router = (0, express_1.Router)();
        this.usersController = new user_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, this.usersController.getUsers);
        this.router.get(`${this.path}/:id`, this.usersController.getUserById);
        this.router.post(`${this.path}`, (0, validation_middleware_1.default)(users_dto_1.CreateUserDto, 'body'), this.usersController.createUser);
        this.router.put(`${this.path}/:id`, (0, validation_middleware_1.default)(users_dto_1.CreateUserDto, 'body', true), this.usersController.updateUser);
        this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
    }
}
exports.default = UserRoute;
//# sourceMappingURL=user.route.js.map
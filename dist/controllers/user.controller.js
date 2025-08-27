"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pick_1 = tslib_1.__importDefault(require("../utils/pick"));
const user_service_1 = tslib_1.__importDefault(require("../services/user.service"));
class UsersController {
    constructor() {
        this.userService = new user_service_1.default();
        this.getUsers = async (req, res, next) => {
            try {
                const filter = (0, pick_1.default)(req.query, ['search']);
                const options = (0, pick_1.default)(req.query, ['sortBy', 'limit', 'page']);
                const findAllUsersData = await this.userService.findAllUser(filter, options);
                res.status(200).json({ data: findAllUsersData, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserById = async (req, res, next) => {
            try {
                const userId = req.params.id;
                const findOneUserData = await this.userService.findUserById(userId);
                res.status(200).json({ data: findOneUserData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createUser = async (req, res, next) => {
            try {
                const userData = req.body;
                const createUserData = await this.userService.createUser(userData);
                res.status(201).json({ data: createUserData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateUser = async (req, res, next) => {
            try {
                const userId = req.params.id;
                const userData = req.body;
                const updateUserData = await this.userService.updateUser(userId, userData);
                res.status(200).json({ data: updateUserData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteUser = async (req, res, next) => {
            try {
                const userId = req.params.id;
                const deleteUserData = await this.userService.deleteUser(userId);
                res.status(200).json({ data: deleteUserData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserRoleUsers = async (req, res, next) => {
            try {
                const users = await this.userService.getAllUserRoleUsers();
                res.status(200).json({ data: users, message: 'findUserRoleUsers' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserRoleSupervisor = async (req, res, next) => {
            try {
                const users = await this.userService.getAllUserRoleSupervisor();
                res.status(200).json({ data: users, message: 'findUserRoleUsers' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = UsersController;
//# sourceMappingURL=user.controller.js.map
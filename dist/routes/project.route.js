"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const project_controller_1 = tslib_1.__importDefault(require("../controllers/project.controller"));
const project_dto_1 = require("../dtos/project.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../middlewares/auth.middleware"));
class ProjectRoute {
    constructor() {
        this.path = '/projects';
        this.router = (0, express_1.Router)();
        this.projectController = new project_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, auth_middleware_1.default, this.projectController.getProjects);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.projectController.getProjectById);
        this.router.post(`${this.path}`, auth_middleware_1.default, (0, validation_middleware_1.default)(project_dto_1.CreateProjectDto, 'body'), this.projectController.createProject);
        this.router.post(`${this.path}/:projectId/bha`, auth_middleware_1.default, (0, validation_middleware_1.default)(project_dto_1.CreateBhaDto, 'body'), this.projectController.createBha);
        this.router.post(`${this.path}/:projectId/perforation`, auth_middleware_1.default, (0, validation_middleware_1.default)(project_dto_1.CreatePerforationDto, 'body'), this.projectController.createPerforation);
        this.router.post(`${this.path}/:projectId/static-data`, auth_middleware_1.default, (0, validation_middleware_1.default)(project_dto_1.CreateProjectStaticDataDto, 'body'), this.projectController.createProjectStaticData);
        this.router.put(`${this.path}/:projectId/perforation/:perforationId`, auth_middleware_1.default, this.projectController.updatePerforation);
        this.router.delete(`${this.path}/:projectId/perforation/:perforationId`, auth_middleware_1.default, this.projectController.deletePerforation);
    }
}
exports.default = ProjectRoute;
//# sourceMappingURL=project.route.js.map
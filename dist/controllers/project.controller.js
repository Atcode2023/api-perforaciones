"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_service_1 = tslib_1.__importDefault(require("../services/project.service"));
const pick_1 = tslib_1.__importDefault(require("../utils/pick"));
const user_service_1 = tslib_1.__importDefault(require("../services/user.service"));
class ProjectController {
    constructor() {
        this.projectService = new project_service_1.default();
        this.userService = new user_service_1.default();
        this.createProject = async (req, res, next) => {
            try {
                const createProjectDto = req.body;
                // ing_day e ing_night deben ser _id de usuario
                const project = await this.projectService.createProject(createProjectDto);
                res.status(201).json({ message: "Proyecto creado correctamente" });
            }
            catch (error) {
                next(error);
            }
        };
        this.createBha = async (req, res, next) => {
            try {
                const projectId = req.params.projectId;
                const bhaData = req.body;
                const bha = await this.projectService.createBha(projectId, bhaData);
                res.status(201).json({ data: bha, message: "BHA creado correctamente" });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPerforation = async (req, res, next) => {
            try {
                const projectId = req.params.projectId;
                const perforationData = req.body;
                const perforation = await this.projectService.createPerforation(projectId, perforationData);
                res.status(201).json({
                    data: perforation,
                    message: "Perforación creada correctamente",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.createProjectStaticData = async (req, res, next) => {
            try {
                const projectId = req.params.projectId;
                const staticDataDto = req.body;
                const result = await this.projectService.createProjectStaticData(projectId, staticDataDto);
                res.status(201).json({
                    data: result,
                    message: "Datos estáticos guardados correctamente",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProjects = async (req, res, next) => {
            try {
                const filter = (0, pick_1.default)(req.query, ["search"]);
                const options = (0, pick_1.default)(req.query, ["sortBy", "limit", "page"]);
                const projects = await this.projectService.findAllProjects(filter, options, req);
                res.status(200).json({ data: projects, message: "findAll" });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProjectById = async (req, res, next) => {
            try {
                const projectId = req.params.id;
                const project = await this.projectService.findProjectById(projectId);
                res.status(200).json({ data: project, message: "findOne" });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePerforation = async (req, res, next) => {
            try {
                const projectId = req.params.projectId;
                const perforationId = req.params.perforationId;
                const updateData = req.body;
                const perforation = await this.projectService.updatePerforation(projectId, perforationId, updateData);
                res.status(200).json({
                    data: perforation,
                    message: "Perforación actualizada correctamente",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePerforation = async (req, res, next) => {
            try {
                const projectId = req.params.projectId;
                const perforationId = req.params.perforationId;
                const result = await this.projectService.deletePerforation(projectId, perforationId);
                res
                    .status(200)
                    .json({ data: result, message: "Perforación eliminada correctamente" });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProjectReport = async (req, res, next) => {
            try {
                const projectId = req.params.projectId;
                const report = await this.projectService.ReportProject(projectId);
                res.status(200).json({
                    data: report,
                    message: "Reporte de proyecto generado correctamente",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProject = async (req, res, next) => {
            try {
                const projectId = req.params.id;
                const data = req.body;
                const updatedProject = await this.projectService.updateProject(projectId, data);
                res.status(200).json({
                    data: updatedProject,
                    message: "Proyecto actualizado correctamente",
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteProject = async (req, res, next) => {
            try {
                const projectId = req.params.id;
                const result = await this.projectService.deleteProject(projectId);
                res
                    .status(200)
                    .json({ data: result, message: "Proyecto eliminado correctamente" });
            }
            catch (error) {
                next(error);
            }
        };
        this.hasProjectChanges = async (req, res, next) => {
            var _a, _b;
            try {
                const projectId = req.params.projectId;
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                const project = await this.projectService.findProjectById(projectId);
                const user = await this.userService.findUserById(userId);
                const hasChanges = !user.last_sync ||
                    (project.has_changes && project.has_changes > user.last_sync);
                if (hasChanges) {
                    user.last_sync = project.has_changes;
                    await this.userService.updateUserLastSync(userId, user);
                }
                res.status(200).json({ changed: !!hasChanges });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetProjectChanges = async (req, res, next) => {
            try {
                await this.projectService.resetProjectChanges(req.params.projectId);
                res.status(200).json({ reset: true });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = ProjectController;
//# sourceMappingURL=project.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_service_1 = tslib_1.__importDefault(require("../services/project.service"));
const pick_1 = tslib_1.__importDefault(require("../utils/pick"));
class ProjectController {
    constructor() {
        this.projectService = new project_service_1.default();
        this.createProject = async (req, res, next) => {
            try {
                const createProjectDto = req.body;
                const project = await this.projectService.createProject(createProjectDto);
                res.status(201).json({ message: 'Proyecto creado correctamente' });
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
                res.status(201).json({ data: bha, message: 'BHA creado correctamente' });
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
                res.status(201).json({ data: perforation, message: 'Perforación creada correctamente' });
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
                res.status(201).json({ data: result, message: 'Datos estáticos guardados correctamente' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProjects = async (req, res, next) => {
            try {
                const filter = (0, pick_1.default)(req.query, ['search']);
                const options = (0, pick_1.default)(req.query, ['sortBy', 'limit', 'page']);
                const projects = await this.projectService.findAllProjects(filter, options);
                res.status(200).json({ data: projects, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getProjectById = async (req, res, next) => {
            try {
                const projectId = req.params.id;
                const project = await this.projectService.findProjectById(projectId);
                res.status(200).json({ data: project, message: 'findOne' });
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
                res.status(200).json({ data: perforation, message: 'Perforación actualizada correctamente' });
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
                res.status(200).json({ data: result, message: 'Perforación eliminada correctamente' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = ProjectController;
//# sourceMappingURL=project.controller.js.map
import { Router } from "express";
import ProjectController from "../controllers/project.controller";
import {
  CreateProjectDto,
  CreateBhaDto,
  CreatePerforationDto,
  CreateProjectStaticDataDto,
} from "../dtos/project.dto";
import { Routes } from "../interfaces/routes.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import authMiddleware from "../middlewares/auth.middleware";

class ProjectRoute implements Routes {
  public path = "/projects";
  public router = Router();
  public projectController = new ProjectController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.projectController.getProjects
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      this.projectController.getProjectById
    );
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(CreateProjectDto, "body"),
      this.projectController.createProject
    );
    this.router.post(
      `${this.path}/:projectId/bha`,
      authMiddleware,
      validationMiddleware(CreateBhaDto, "body"),
      this.projectController.createBha
    );
    this.router.post(
      `${this.path}/:projectId/perforation`,
      authMiddleware,
      validationMiddleware(CreatePerforationDto, "body"),
      this.projectController.createPerforation
    );
    this.router.post(
      `${this.path}/:projectId/static-data`,
      authMiddleware,
      validationMiddleware(CreateProjectStaticDataDto, "body"),
      this.projectController.createProjectStaticData
    );
    this.router.put(
      `${this.path}/:projectId/perforation/:perforationId`,
      authMiddleware,
      this.projectController.updatePerforation
    );
    this.router.delete(
      `${this.path}/:projectId/perforation/:perforationId`,
      authMiddleware,
      this.projectController.deletePerforation
    );
    this.router.get(
      `${this.path}/:projectId/report`,
      authMiddleware,
      this.projectController.getProjectReport
    );
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      this.projectController.updateProject
    );
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      this.projectController.deleteProject
    );
    this.router.get(
      `${this.path}/:projectId/has-changes`,
      authMiddleware,
      this.projectController.hasProjectChanges
    );
    this.router.post(
      `${this.path}/:projectId/reset-changes`,
      authMiddleware,
      this.projectController.resetProjectChanges
    );
  }
}

export default ProjectRoute;

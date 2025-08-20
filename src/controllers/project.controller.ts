import { Request, Response, NextFunction } from "express";
import ProjectService from "../services/project.service";
import {
  CreateProjectDto,
  CreateProjectStaticDataDto,
} from "../dtos/project.dto";
import pick from "../utils/pick";
import userService from "@/services/user.service";

class ProjectController {
  public projectService = new ProjectService();
  public userService = new userService();

  public createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createProjectDto: CreateProjectDto = req.body;
      // ing_day e ing_night deben ser _id de usuario
      const project = await this.projectService.createProject(createProjectDto);
      res.status(201).json({ message: "Proyecto creado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  public createBha = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const bhaData = req.body;
      const bha = await this.projectService.createBha(projectId, bhaData);
      res.status(201).json({ data: bha, message: "BHA creado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  public createPerforation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const perforationData = req.body;
      const perforation = await this.projectService.createPerforation(
        projectId,
        perforationData
      );
      res.status(201).json({
        data: perforation,
        message: "Perforación creada correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  public createProjectStaticData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const staticDataDto: CreateProjectStaticDataDto = req.body;
      const result = await this.projectService.createProjectStaticData(
        projectId,
        staticDataDto
      );
      res.status(201).json({
        data: result,
        message: "Datos estáticos guardados correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  public getProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const filter = pick(req.query, ["search"]);
      const options = pick(req.query, ["sortBy", "limit", "page"]);
      const projects = await this.projectService.findAllProjects(
        filter,
        options,
        req
      );
      res.status(200).json({ data: projects, message: "findAll" });
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.id;
      const project = await this.projectService.findProjectById(projectId);

      res.status(200).json({ data: project, message: "findOne" });
    } catch (error) {
      next(error);
    }
  };

  public updatePerforation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const perforationId = req.params.perforationId;
      const updateData = req.body;
      const perforation = await this.projectService.updatePerforation(
        projectId,
        perforationId,
        updateData
      );
      res.status(200).json({
        data: perforation,
        message: "Perforación actualizada correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  public deletePerforation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const perforationId = req.params.perforationId;
      const result = await this.projectService.deletePerforation(
        projectId,
        perforationId
      );
      res
        .status(200)
        .json({ data: result, message: "Perforación eliminada correctamente" });
    } catch (error) {
      next(error);
    }
  };

  public getProjectReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const report = await this.projectService.ReportProject(projectId);
      res.status(200).json({
        data: report,
        message: "Reporte de proyecto generado correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.id;
      const data = req.body;
      const updatedProject = await this.projectService.updateProject(
        projectId,
        data
      );
      res.status(200).json({
        data: updatedProject,
        message: "Proyecto actualizado correctamente",
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.id;
      const result = await this.projectService.deleteProject(projectId);
      res
        .status(200)
        .json({ data: result, message: "Proyecto eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };

  public hasProjectChanges = async (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const projectId = req.params.projectId;
      const userId = req.user?._id || req.user?.id;
      const project = await this.projectService.findProjectById(projectId);
      const user = await this.userService.findUserById(userId);

      const hasChanges =
        !user.last_sync ||
        (project.has_changes && project.has_changes > user.last_sync);

      if (hasChanges) {
        user.last_sync = project.has_changes;
        await this.userService.updateUserLastSync(userId, user);
      }

      res.status(200).json({ changed: !!hasChanges });
    } catch (error) {
      next(error);
    }
  };

  public resetProjectChanges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.projectService.resetProjectChanges(req.params.projectId);
      res.status(200).json({ reset: true });
    } catch (error) {
      next(error);
    }
  };
}

export default ProjectController;

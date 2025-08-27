import { Request, Response, NextFunction } from "express";
import ProjectService from "../services/project.service";
import userService from "../services/user.service";
declare class ProjectController {
    projectService: ProjectService;
    userService: userService;
    createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createBha: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPerforation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createProjectStaticData: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjects: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePerforation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePerforation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    hasProjectChanges: (req: any, res: Response, next: NextFunction) => Promise<void>;
    resetProjectChanges: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default ProjectController;

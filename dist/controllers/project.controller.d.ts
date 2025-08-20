import { Request, Response, NextFunction } from 'express';
import ProjectService from '../services/project.service';
declare class ProjectController {
    projectService: ProjectService;
    createProject: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createBha: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPerforation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createProjectStaticData: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjects: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProjectById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePerforation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePerforation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default ProjectController;

import ProjectController from "../controllers/project.controller";
import { Routes } from "../interfaces/routes.interface";
declare class ProjectRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    projectController: ProjectController;
    constructor();
    private initializeRoutes;
}
export default ProjectRoute;

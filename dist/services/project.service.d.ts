import { IOptions, QueryResult } from "../paginate/paginate";
import { CreateProjectDto } from "../dtos/project.dto";
import { Bha, IUProyectModel, Perforations, Project } from "../models/proyect.model";
declare class ProjectService {
    proyects: IUProyectModel;
    createProject(projectData: CreateProjectDto): Promise<Project>;
    createBha(projectId: string, bhaData: Bha): Promise<any>;
    createPerforation(projectId: string, perforationData: Perforations): Promise<any>;
    updatePerforation(projectId: string, perforationId: string, updateData: Partial<Perforations>): Promise<any>;
    deletePerforation(projectId: string, perforationId: string): Promise<any>;
    findAllProjects(filter: Record<string, any>, options: IOptions): Promise<QueryResult>;
    findProjectById(projectId: string): Promise<any>;
    createProjectStaticData(projectId: string, staticData: any): Promise<import("../models/proyect.model").ProjectStaticData>;
    private calculatePerforationFields;
}
export default ProjectService;

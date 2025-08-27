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
    findAllProjects(filter: Record<string, any>, options: IOptions, req?: any): Promise<QueryResult>;
    findProjectById(projectId: string): Promise<any>;
    createProjectStaticData(projectId: string, staticData: any): Promise<import("../models/proyect.model").ProjectStaticData>;
    private calculatePerforationFields;
    /**
     * Prepara la data para gráficas del proyecto.
     * Por ahora incluye la data para pie chart de actividades, pero está listo para agregar más.
     */
    ReportProject(projectId: string): Promise<{
        charts: {
            activityPie?: {
                labels: string[];
                data: number[];
                percentages: number[];
                raw: {
                    activity: string;
                    time: number;
                    percentage: number;
                }[];
            };
            drilledFeetPlanVsReal?: {
                labels: string[];
                planned: number[];
                real: number[];
                raw: {
                    date: string;
                    planned: number;
                    real: number;
                }[];
            };
            drilledFeetDay?: {
                labels: string[];
                planned: number[];
                real: number[];
                raw: {
                    date: string;
                    planned: number;
                    real: number;
                }[];
            };
            drilledFeetNight?: {
                labels: string[];
                planned: number[];
                real: number[];
                raw: {
                    date: string;
                    planned: number;
                    real: number;
                }[];
            };
            ropAverage?: {
                labels: string[];
                planned: number[];
                real: number[];
                raw: {
                    date: string;
                    planned: number;
                    real: number;
                }[];
            };
            ropRotatedByShift?: {
                labels: string[];
                ropDay: number[];
                ropNight: number[];
                ropKpi: number[];
                raw: {
                    date: string;
                    ropDay: number;
                    ropNight: number;
                    ropKpi: number;
                }[];
            };
            reviewTimeByShift?: {
                labels: number[];
                time: number[];
                day: number[];
                night: number[];
                kpi: number[];
                raw: {
                    index: number;
                    time: number;
                    shift: string;
                    kpi: number;
                }[];
            };
            surveyTimeByShift?: {
                labels: number[];
                time: number[];
                day: number[];
                night: number[];
                kpi: number[];
                raw: {
                    index: number;
                    time: number;
                    shift: string;
                    kpi: number;
                }[];
            };
            conexionTimeByShift?: {
                labels: number[];
                time: number[];
                day: number[];
                night: number[];
                kpi: number[];
                raw: {
                    index: number;
                    time: number;
                    shift: string;
                    kpi: number;
                }[];
            };
        };
    }>;
    updateProject(projectId: string, updateData: Partial<any>): Promise<any>;
    deleteProject(projectId: string): Promise<any>;
    resetProjectChanges(projectId: string): Promise<void>;
}
export default ProjectService;

import { Routes } from '@interfaces/routes.interface';
import express from 'express';
import 'reflect-metadata';
declare class App {
    app: express.Application;
    env: string;
    port: string | number;
    constructor(routes: Routes[]);
    listen(): void;
    closeDatabaseConnection(): Promise<void>;
    getServer(): express.Application;
    private connectToDatabase;
    private initializeMiddlewares;
    private initializeRoutes;
    private initializePublicPath;
    private initializeSwagger;
    private initializeErrorHandling;
}
export default App;

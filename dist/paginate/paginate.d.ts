import { Document, Schema } from 'mongoose';
export interface QueryResult {
    results: Document[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}
export interface IOptions {
    sortBy?: string;
    projectBy?: string;
    populate?: string;
    limit?: number;
    page?: number;
    sort?: any;
}
declare const paginate: <T extends Document>(schema: Schema<T>) => void;
export default paginate;

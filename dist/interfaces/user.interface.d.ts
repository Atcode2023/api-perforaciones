export interface User {
    _id?: string;
    username: string;
    password: string;
    role: string;
    created_at: Date;
    deleted_at: Date | null;
}

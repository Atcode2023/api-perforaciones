import { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } from '../config';

export const dbConnection = {
  url: `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?authSource=admin`,
  // Fallback without auth:
  // url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};
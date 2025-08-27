"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const config_1 = require("../config");
exports.dbConnection = {
    url: `mongodb://${config_1.DB_USERNAME}:${config_1.DB_PASSWORD}@${config_1.DB_HOST}:${config_1.DB_PORT}/${config_1.DB_DATABASE}?authSource=admin`,
    // Fallback without auth:
    // url: `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
};
//# sourceMappingURL=index.js.map
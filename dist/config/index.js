"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_PASSWORD = exports.DB_USERNAME = exports.API_DOMAIN = exports.APP_DOMAIN = exports.SMTP_PWD = exports.SMTP_USER = exports.ORIGIN = exports.LOG_DIR = exports.LOG_FORMAT = exports.SECRET_KEY = exports.DB_DATABASE = exports.DB_PORT = exports.DB_HOST = exports.PORT = exports.NODE_ENV = exports.CREDENTIALS = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
exports.CREDENTIALS = process.env.CREDENTIALS === 'true';
_a = process.env, exports.NODE_ENV = _a.NODE_ENV, exports.PORT = _a.PORT, exports.DB_HOST = _a.DB_HOST, exports.DB_PORT = _a.DB_PORT, exports.DB_DATABASE = _a.DB_DATABASE, exports.SECRET_KEY = _a.SECRET_KEY, exports.LOG_FORMAT = _a.LOG_FORMAT, exports.LOG_DIR = _a.LOG_DIR, exports.ORIGIN = _a.ORIGIN, exports.SMTP_USER = _a.SMTP_USER, exports.SMTP_PWD = _a.SMTP_PWD, exports.APP_DOMAIN = _a.APP_DOMAIN, exports.API_DOMAIN = _a.API_DOMAIN, exports.DB_USERNAME = _a.DB_USERNAME, exports.DB_PASSWORD = _a.DB_PASSWORD;
//# sourceMappingURL=index.js.map
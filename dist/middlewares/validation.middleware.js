"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("../exceptions/HttpException");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validationMiddleware = (type, value = 'body', skipMissingProperties = false, whitelist = true, forbidNonWhitelisted = true) => {
    return (req, res, next) => {
        (0, class_validator_1.validate)((0, class_transformer_1.plainToClass)(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors) => {
            if (errors.length > 0) {
                const message = errors
                    .map((error) => {
                    if (error.constraints) {
                        return Object.values(error.constraints).join(', ');
                    }
                    // Si hay hijos, busca los mensajes en los hijos
                    if (error.children && error.children.length > 0) {
                        return error.children
                            .map(child => child.constraints ? Object.values(child.constraints).join(', ') : '')
                            .filter(Boolean)
                            .join(', ');
                    }
                    return '';
                })
                    .filter(Boolean)
                    .join(', ');
                next(new HttpException_1.HttpException(400, message || 'Validation error'));
            }
            else {
                next();
            }
        });
    };
};
exports.default = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const types_1 = require("../types");
const logger_1 = require("../infrastructure/logging/logger");
const errorMiddleware = (error, req, res, next) => {
    logger_1.logger.error('Error caught by middleware:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });
    if (error instanceof types_1.BaseError) {
        return res.status(error.statusCode).json({
            error: {
                message: error.message,
                code: error.code,
            },
        });
    }
    // For unhandled errors, return a generic error message in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
        error: {
            message: isProduction ? 'Internal server error' : error.message,
            code: 'INTERNAL_SERVER_ERROR',
        },
    });
};
exports.errorMiddleware = errorMiddleware;

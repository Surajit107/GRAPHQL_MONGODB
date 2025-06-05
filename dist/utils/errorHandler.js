"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const types_1 = require("../types");
const logger_1 = require("../infrastructure/logging/logger");
const handleError = (error) => {
    if (error instanceof types_1.BaseError) {
        logger_1.logger.error(error.message, {
            statusCode: error.statusCode,
            code: error.code,
            stack: error.stack,
        });
    }
    else {
        logger_1.logger.error('Unhandled error:', {
            message: error.message,
            stack: error.stack,
        });
    }
};
exports.handleError = handleError;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.logError = exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../../config/env");
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const logger = winston_1.default.createLogger({
    level: env_1.env.logLevel,
    format: logFormat,
    defaultMeta: { service: 'graphql-api' },
    transports: [
        // Write all logs to console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        }),
        // Write all logs with level 'error' and below to error.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(env_1.env.logFilePath, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Write all logs to combined.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(env_1.env.logFilePath, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});
exports.logger = logger;
// Create a stream object for Morgan
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};
// Export a function to log errors
const logError = (error, context) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        ...context
    });
};
exports.logError = logError;

import winston from 'winston';
import { env } from '../../config/env';
import path from 'path';

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: env.logLevel,
    format: logFormat,
    defaultMeta: { service: 'graphql-api' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(env.logFilePath, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(env.logFilePath, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Create a stream object for Morgan
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};

// Export a function to log errors
export const logError = (error: Error, context?: any) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        ...context
    });
};

export { logger }; 
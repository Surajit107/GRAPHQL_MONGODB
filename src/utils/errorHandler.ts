import { BaseError } from '../types';
import { logger } from '../infrastructure/logging/logger';

export const handleError = (error: Error): void => {
    if (error instanceof BaseError) {
        logger.error(error.message, {
            statusCode: error.statusCode,
            code: error.code,
            stack: error.stack,
        });
    } else {
        logger.error('Unhandled error:', {
            message: error.message,
            stack: error.stack,
        });
    }
}; 
import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../types';
import { logger } from '../infrastructure/logging/logger';

export const errorMiddleware = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error caught by middleware:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    if (error instanceof BaseError) {
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
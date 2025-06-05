export class BaseError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends BaseError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends BaseError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends BaseError {
    constructor(message: string = 'Not authorized') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR');
    }
}

export class ConflictError extends BaseError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

export class DatabaseError extends BaseError {
    constructor(message: string = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
    }
} 
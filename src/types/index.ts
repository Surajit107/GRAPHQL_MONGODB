import { User, UserInput, AuthPayload } from '../core/interfaces/user.interface';

export type { User, UserInput, AuthPayload };

export interface Config {
  // Server Configuration
  port: number;
  environment: 'development' | 'production' | 'test';
  
  // MongoDB Configuration
  mongoUri: string;
  
  // JWT Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  
  // CORS Configuration
  corsOrigin: string[];
  
  // Security
  bcryptSaltRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Two-Factor Authentication
  twoFactorAppName: string;
  twoFactorIssuer: string;
  
  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logFilePath: string;
  
  // API Configuration
  apiPrefix: string;
  graphqlPath: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class BaseError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
} 
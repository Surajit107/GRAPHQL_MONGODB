"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const validateLogLevel = (level) => {
    const validLevels = ['error', 'warn', 'info', 'debug'];
    return validLevels.includes(level) ? level : 'debug';
};
const validateEnv = () => {
    const requiredEnvVars = [
        'PORT',
        'NODE_ENV',
        'MONGODB_URI',
        'JWT_SECRET',
        'CORS_ORIGIN'
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
    const config = {
        port: parseInt(process.env.PORT || '4000'),
        mongoUri: process.env.MONGODB_URI || '',
        jwtSecret: process.env.JWT_SECRET || '',
        environment: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        twoFactorAppName: process.env.TWO_FACTOR_APP_NAME || 'GraphQL_MongoDB_App',
        twoFactorIssuer: process.env.TWO_FACTOR_ISSUER || 'YourCompanyName',
        logLevel: validateLogLevel(process.env.LOG_LEVEL || 'debug'),
        logFilePath: process.env.LOG_FILE_PATH || 'logs/app.log',
        apiPrefix: process.env.API_PREFIX || '/api',
        graphqlPath: process.env.GRAPHQL_PATH || '/graphql'
    };
    return config;
};
exports.env = validateEnv();
//# sourceMappingURL=env.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const http_1 = __importDefault(require("http"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const graphql_1 = require("./core/graphql");
const database_1 = require("./infrastructure/database");
const env_1 = require("./config/env");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const logger_1 = require("./infrastructure/logging/logger");
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimitWindowMs,
    max: env_1.env.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Enable CORS
app.use((0, cors_1.default)({
    origin: env_1.env.corsOrigin,
    credentials: true,
}));
const server = new server_1.ApolloServer({
    typeDefs: graphql_1.typeDefs,
    resolvers: graphql_1.resolvers,
    plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    introspection: env_1.env.environment !== 'production',
});
// Error handling middleware
app.use(errorMiddleware_1.errorMiddleware);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)(env_1.env);
        await server.start();
        app.use(env_1.env.graphqlPath, (0, express4_1.expressMiddleware)(server, {
            context: async ({ req }) => {
                let token = '';
                const authHeader = req.headers.authorization || '';
                if (authHeader.startsWith('Bearer ')) {
                    token = authHeader.replace('Bearer ', '');
                }
                else {
                    token = authHeader;
                }
                if (!token && req.headers.cookie) {
                    const cookies = cookie_1.default.parse(req.headers.cookie);
                    token = cookies['token'] || '';
                }
                if (!token)
                    return {};
                try {
                    const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
                    return { user: { id: payload.userId } };
                }
                catch (err) {
                    logger_1.logger.error('JWT verification error:', { error: err });
                    return {};
                }
            },
        }));
        await new Promise((resolve) => httpServer.listen({ port: env_1.env.port }, resolve));
        logger_1.logger.info(`🚀 Server ready at http://localhost:${env_1.env.port}${env_1.env.graphqlPath}`);
        logger_1.logger.info(`Environment: ${env_1.env.environment}`);
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', { error });
        process.exit(1);
    }
};
exports.startServer = startServer;

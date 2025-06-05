import 'dotenv/config';
import express, { Request } from 'express';
import cors from 'cors';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import rateLimit from 'express-rate-limit';

import { typeDefs, resolvers } from './core/graphql';
import { connectDatabase } from './infrastructure/database';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { logger } from './infrastructure/logging/logger';

const app = express();
const httpServer = http.createServer(app);

// Rate limiting
const limiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Enable CORS and JSON parsing
app.use(cors({
    origin: env.corsOrigin,
    credentials: true,
}));
app.use(express.json());

interface Context {
    user?: {
        id: string;
    };
}

const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: env.environment !== 'production',
});

// Error handling middleware
app.use(errorMiddleware);

export const startServer = async () => {
    try {
        await connectDatabase(env);
        await server.start();

        app.use(
            env.graphqlPath,
            expressMiddleware(server, {
                context: async ({ req }: { req: Request }): Promise<Context> => {
                    let token = '';
                    const authHeader = req.headers.authorization || '';
                    if (authHeader.startsWith('Bearer ')) {
                        token = authHeader.replace('Bearer ', '');
                    } else {
                        token = authHeader;
                    }

                    if (!token && req.headers.cookie) {
                        const cookies = cookie.parse(req.headers.cookie);
                        token = cookies['token'] || '';
                    }

                    if (!token) return {};

                    try {
                        const payload = jwt.verify(token, env.jwtSecret) as { userId: string };
                        return { user: { id: payload.userId } };
                    } catch (err) {
                        logger.error('JWT verification error:', { error: err });
                        return {};
                    }
                },
            })
        );

        await new Promise<void>((resolve) => httpServer.listen({ port: env.port }, resolve));
        logger.info(`🚀 Server ready at http://localhost:${env.port}${env.graphqlPath}`);
        logger.info(`Environment: ${env.environment}`);
    } catch (error) {
        logger.error('Failed to start server:', { error });
        process.exit(1);
    }
};
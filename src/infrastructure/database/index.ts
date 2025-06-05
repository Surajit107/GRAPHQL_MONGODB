import mongoose from 'mongoose';
import { Config } from '../../types';
import { logger } from '../logging/logger';

export const connectDatabase = async (config: Config): Promise<void> => {
    try {
        const options = {
            autoIndex: config.environment !== 'production',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(config.mongoUri, options);
        logger.info('Connected to MongoDB');

        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error:', { error });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                logger.error('Error during MongoDB disconnection:', { error });
                process.exit(1);
            }
        });
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', { error });
        throw error;
    }
}; 
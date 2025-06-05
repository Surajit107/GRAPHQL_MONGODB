"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../logging/logger");
const connectDatabase = async (config) => {
    try {
        const options = {
            autoIndex: config.environment !== 'production',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        await mongoose_1.default.connect(config.mongoUri, options);
        logger_1.logger.info('Connected to MongoDB');
        mongoose_1.default.connection.on('error', (error) => {
            logger_1.logger.error('MongoDB connection error:', { error });
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
        });
        process.on('SIGINT', async () => {
            try {
                await mongoose_1.default.connection.close();
                logger_1.logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            }
            catch (error) {
                logger_1.logger.error('Error during MongoDB disconnection:', { error });
                process.exit(1);
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to MongoDB:', { error });
        throw error;
    }
};
exports.connectDatabase = connectDatabase;

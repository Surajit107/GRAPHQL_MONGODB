import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LoggerService } from './logger.service';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly logger: LoggerService,
  ) {}

  async getConnection(): Promise<Connection> {
    return this.connection;
  }

  async isConnected(): Promise<boolean> {
    return this.connection.readyState === 1;
  }

  async closeConnection(): Promise<void> {
    try {
      await this.connection.close();
      this.logger.log('Database connection closed successfully');
    } catch (error) {
      this.logger.error('Error closing database connection', error.stack);
      throw error;
    }
  }
} 
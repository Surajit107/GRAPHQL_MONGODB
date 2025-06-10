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

  getConnection(): Connection {
    return this.connection;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const status = this.connection.readyState;
      // 1 = connected
      return status === 1;
    } catch (error) {
      this.logger.error('Database health check failed', error.stack);
      return false;
    }
  }
}
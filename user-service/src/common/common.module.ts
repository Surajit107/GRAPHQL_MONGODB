import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { DatabaseService } from './services/database.service';

@Module({
  providers: [LoggerService, DatabaseService],
  exports: [LoggerService, DatabaseService],
})
export class CommonModule {}
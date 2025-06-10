import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './services/logger.service';
import { DatabaseService } from './services/database.service';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService, DatabaseService],
  exports: [LoggerService, DatabaseService],
})
export class CommonModule {}
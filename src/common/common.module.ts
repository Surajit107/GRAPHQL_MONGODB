import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './services/logger.service';
import { DatabaseService } from './services/database.service';
import { EmailService } from './services/email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  providers: [LoggerService, DatabaseService, EmailService],
  exports: [LoggerService, DatabaseService, EmailService],
})
export class CommonModule { };
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';
import { CommonModule } from '../common/common.module';
import { EmailResolver } from './graphql/email.resolver';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [EmailController],
  providers: [EmailService, EmailResolver],
  exports: [EmailService],
})
export class EmailModule {}
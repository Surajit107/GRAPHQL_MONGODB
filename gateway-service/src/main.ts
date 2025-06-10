import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isDev = configService.get<string>('NODE_ENV') !== 'production';

  // Security
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  const port = isDev ? 3000 : configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log('┌──────────────────────────────────────────┐');
  logger.log('│          Microservices Status            │');
  logger.log('├──────────────────────────────────────────┤');
  logger.log('│ Auth Service    : http://localhost:3001  │');
  logger.log('│ User Service    : http://localhost:3002  │');
  logger.log('├──────────────────────────────────────────┤');
  logger.log('│ Gateway Status  : ONLINE                 │');
  logger.log('│ Gateway URL     : http://localhost:3000  │');
  logger.log('├──────────────────────────────────────────┤');
  logger.log('│ Apollo Sandbox  : http://localhost:3000/graphql │');
  logger.log('└──────────────────────────────────────────┘');
}

bootstrap(); 
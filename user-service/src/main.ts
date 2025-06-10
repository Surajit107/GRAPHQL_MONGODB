import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('users');

  // Force port 3002 for development, use PORT env var for production
  const port = isDev ? 3002 : configService.get<number>('PORT', 3002);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.log('┌──────────────────────────────────────────┐');
  logger.log('│            User Service Status           │');
  logger.log('├──────────────────────────────────────────┤');
  logger.log(`│ Status         : ONLINE                  │`);
  logger.log(`│ GraphQL URL    : http://${host}:${port}/users/graphql │`);
  logger.log('└──────────────────────────────────────────┘');
}

bootstrap();
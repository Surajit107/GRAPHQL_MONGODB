import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // Global middleware
  app.use(helmet());
  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // GraphQL configuration
  app.enableShutdownHooks();

  // Add this redirect for browser GET requests to /graphql
  app.getHttpAdapter().get('/graphql', (req, res) => {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      res.redirect(
        'https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:3000/graphql',
      );
    } else {
      res.status(404).send('Not found');
    }
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/graphql`);
}

bootstrap(); 
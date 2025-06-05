import { plainToInstance } from 'class-transformer';
import { IsEnum, IsString, validateSync } from 'class-validator';
import { z } from 'zod';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  CORS_ORIGIN: string;

  @IsString()
  PORT: string;
}

const envSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment).default(Environment.Development),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
  PORT: z.string().default('3000'),
});

export function validate(config: Record<string, unknown>) {
  const validatedConfig = envSchema.parse(config);

  const validatedEnv = plainToInstance(EnvironmentVariables, validatedConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedEnv, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
} 
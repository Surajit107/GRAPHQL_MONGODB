import { z } from 'zod';

export function validate(config: Record<string, unknown>) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3002),
    CORS_ORIGIN: z.string().default('*'),
    MONGODB_URI: z.string(),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
    RATE_LIMIT_WINDOW: z.coerce.number().default(15),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    HEALTH_CHECK_PATH: z.string().default('/health'),
    HEALTH_CHECK_INTERVAL: z.coerce.number().default(5000),
  });

  try {
    const validatedConfig = schema.parse(config);
    return validatedConfig;
  } catch (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
}
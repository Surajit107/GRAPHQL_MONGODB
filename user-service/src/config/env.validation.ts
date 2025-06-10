import { z } from 'zod';

export function validate(config: Record<string, unknown>) {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    CORS_ORIGIN: z.string().default('*'),
    MONGODB_URI: z.string(),
    AUTH_SERVICE_URL: z.string().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
    RATE_LIMIT_WINDOW: z.coerce.number().default(15),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
  });

  try {
    const validatedConfig = schema.parse(config);
    return validatedConfig;
  } catch (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }
}
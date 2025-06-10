import { z } from 'zod';

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Services
  USER_SERVICE_URL: z.string().default('http://localhost:3002/graphql'),
  COMMON_SERVICE_URL: z.string().default('http://localhost:3003/graphql'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(15),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // HTTP Client
  HTTP_TIMEOUT: z.coerce.number().default(5000),
  HTTP_MAX_REDIRECTS: z.coerce.number().default(5),

  // Security
  ENABLE_HELMET: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),

  // 2FA
  TWO_FACTOR_AUTHENTICATION_APP_NAME: z.string().default('YourAppName'),

  // Email
  EMAIL_HOST: z.string().default('smtp.example.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_USER: z.string().default('your-email@example.com'),
  EMAIL_PASSWORD: z.string().default('your-email-password'),
  EMAIL_FROM: z.string().default('noreply@example.com'),
  EMAIL_DOMAIN: z.string().default('example.com'),
});

export type EnvSchema = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
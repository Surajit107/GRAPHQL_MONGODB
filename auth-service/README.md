# Auth Service

The Auth Service is a microservice responsible for handling authentication and authorization in the application. It provides GraphQL APIs for user registration, login, token management, two-factor authentication, password reset, and email verification.

## Features

### Authentication
- User registration
- User login
- Token refresh
- Logout

### Two-Factor Authentication (2FA)
- Generate 2FA setup
- Verify 2FA setup
- Login with 2FA
- Disable 2FA

### Password Management
- Request password reset
- Reset password

### Email Verification
- Verify email
- Resend verification email

## API Documentation

### GraphQL Mutations

#### Registration and Login
- `register(input: RegisterInput): AuthResponse` - Register a new user
- `login(input: LoginInput): AuthResponse` - Login with email and password
- `loginWith2FA(input: Verify2FALoginInput): AuthResponse` - Login with 2FA
- `refreshToken(input: RefreshTokenInput): AuthResponse` - Refresh access token
- `logout(input: LogoutInput): LogoutResponse` - Logout and invalidate refresh token

#### Two-Factor Authentication
- `generate2FA(input: Enable2FAInput): TwoFactorAuthResponse` - Generate 2FA setup
- `verify2FA(input: Verify2FAInput): VerifyTwoFactorAuthResponse` - Verify 2FA setup
- `disable2FA(): VerifyTwoFactorAuthResponse` - Disable 2FA

#### Password Management
- `requestPasswordReset(input: RequestPasswordResetInput): PasswordResetResponse` - Request password reset
- `resetPassword(input: ResetPasswordInput): PasswordResetResponse` - Reset password

#### Email Verification
- `verifyEmail(input: VerifyEmailInput): EmailVerificationResponse` - Verify email
- `resendVerificationEmail(email: String): EmailVerificationResponse` - Resend verification email

## Configuration

The service can be configured using environment variables. See `.env.sample` for available options.

### Environment Variables

#### Application
- `NODE_ENV` - Environment (development, production, test)
- `PORT` - Port to run the service on
- `CORS_ORIGIN` - CORS origin

#### Database
- `MONGODB_URI` - MongoDB connection URI

#### JWT
- `JWT_SECRET` - Secret for JWT signing
- `JWT_ACCESS_EXPIRATION` - Access token expiration time
- `JWT_REFRESH_EXPIRATION` - Refresh token expiration time

#### Service URLs
- `USER_SERVICE_URL` - URL of the User Service
- `COMMON_SERVICE_URL` - URL of the Common Service

#### Logging
- `LOG_LEVEL` - Log level (debug, info, warn, error)

#### Rate Limiting
- `RATE_LIMIT_WINDOW` - Rate limit window in milliseconds
- `RATE_LIMIT_MAX` - Maximum number of requests in window

#### Two-Factor Authentication
- `TWO_FACTOR_AUTHENTICATION_APP_NAME` - App name for 2FA

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- User Service
- Common Service

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.sample`
4. Start the service
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## Development

### Build
```bash
npm run build
```

### Test
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting
```bash
npm run lint
```

## Docker

A Dockerfile is provided to containerize the service.

```bash
# Build the image
docker build -t auth-service .

# Run the container
docker run -p 3000:3000 --env-file .env auth-service
```
# Common Service

This service provides common functionality that can be shared across microservices in the application, including:

- Email sending capabilities (REST and GraphQL APIs)
- Health check endpoints
- Shared logging service
- Database connection management

## Features

### Email Service

Provides functionality for sending various types of emails:

- Verification emails
- Password reset emails
- Welcome emails
- Custom emails with attachments

Accessible via both REST API and GraphQL API.

### Health Checks

Endpoint for monitoring service health:

- Database connection status
- Overall service status

### Logging

Centralized logging service with:

- Multiple log levels (debug, info, warn, error)
- Console and file transports
- Contextual logging

## API Documentation

### REST Endpoints

#### Email API

- `POST /email/send` - Send a custom email
- `POST /email/verification` - Send a verification email
- `POST /email/password-reset` - Send a password reset email
- `POST /email/welcome` - Send a welcome email

#### Health API

- `GET /health` - Check service health

### GraphQL API

#### Email Mutations

- `sendEmail` - Send a custom email
- `sendVerificationEmail` - Send a verification email
- `sendPasswordResetEmail` - Send a password reset email
- `sendWelcomeEmail` - Send a welcome email

## Configuration

The service is configured using environment variables:

- `NODE_ENV` - Environment (development, production)
- `PORT` - Port to run the service on
- `CORS_ORIGIN` - CORS origin configuration
- `MONGODB_URI` - MongoDB connection string
- `LOG_LEVEL` - Logging level
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP server username
- `SMTP_PASS` - SMTP server password
- `SMTP_SECURE` - Whether to use secure connection
- `SMTP_FROM` - Default sender email address
- `FRONTEND_URL` - Frontend URL for email links

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.sample`
4. Start the service: `npm run start:dev`

## Development

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start the application in development mode
- `npm run test` - Run tests
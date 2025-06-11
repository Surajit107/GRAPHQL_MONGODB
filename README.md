# GraphQL MongoDB API with NestJS

A production-ready GraphQL API built with NestJS, MongoDB, and TypeScript, featuring user authentication and modern development practices.

## Features

- 🚀 **NestJS** - A progressive Node.js framework
- 📊 **GraphQL** - Modern API query language
- 🗄️ **MongoDB** - NoSQL database with Mongoose ODM
- 🔐 **Authentication** - JWT-based authentication with refresh tokens
- 🛡️ **Security** - Built-in security features (Helmet, CORS, Rate Limiting)
- 📝 **Validation** - Request validation using class-validator
- 🔍 **Logging** - Structured logging with Winston
- 🧪 **Testing** - Jest testing framework
- 🎨 **Code Style** - ESLint and Prettier for consistent code style

## Prerequisites

- Node.js (>= 18.0.0)
- MongoDB (>= 4.4)
- npm or yarn

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd graphql_mongodb

# Install dependencies
npm install

# Copy environment file
cp .env.sample .env

# Update environment variables in .env
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database
MONGODB_URI=mongodb://localhost:27017/graphql_mongodb

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d

# Logging
LOG_LEVEL=info
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Debug
npm run start:debug
```

## API Documentation

Once the application is running, you can access:

- GraphQL Playground: http://localhost:3000/graphql
- API Documentation: http://localhost:3000/api

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # Users module
├── common/              # Common utilities and services
├── config/              # Configuration files
├── app.module.ts        # Root application module
└── main.ts             # Application entry point
```

## Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run test:cov` - Run test coverage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository. 
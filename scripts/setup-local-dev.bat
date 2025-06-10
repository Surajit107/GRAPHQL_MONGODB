@echo off
REM Local Development Setup Script for GraphQL MongoDB Microservices
REM This script helps set up the local development environment on Windows

echo Setting up local development environment for GraphQL MongoDB Microservices

REM Create .env files from .env.sample files
echo Creating .env files from .env.sample files...

REM Root directory
if exist ".env.sample" if not exist ".env" (
  copy .env.sample .env
  echo Created .env in root directory
)

REM Auth service
if exist "auth-service\.env.sample" if not exist "auth-service\.env" (
  copy auth-service\.env.sample auth-service\.env
  echo Created .env in auth-service directory
)

REM User service
if exist "user-service\.env.sample" if not exist "user-service\.env" (
  copy user-service\.env.sample user-service\.env
  echo Created .env in user-service directory
)

REM Common service
if exist "common-service\.env.sample" if not exist "common-service\.env" (
  copy common-service\.env.sample common-service\.env
  echo Created .env in common-service directory
)

REM Install dependencies
echo Installing dependencies...

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
  echo npm is not installed. Please install Node.js and npm first.
  exit /b 1
)

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Install auth-service dependencies
echo Installing auth-service dependencies...
cd auth-service
call npm install
cd ..

REM Install user-service dependencies
echo Installing user-service dependencies...
cd user-service
call npm install
cd ..

REM Install common-service dependencies
echo Installing common-service dependencies...
cd common-service
call npm install
cd ..

echo Local development environment setup completed!
echo.
echo Next steps:
echo 1. Update the .env files with your actual values
echo 2. Start the services using 'docker-compose up' or manually start each service
echo 3. Access the GraphQL playground at http://localhost:3000/graphql

pause
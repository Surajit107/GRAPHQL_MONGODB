#!/bin/bash

# Local Development Setup Script for GraphQL MongoDB Microservices
# This script helps set up the local development environment

# Exit on error
set -e

echo "Setting up local development environment for GraphQL MongoDB Microservices"

# Create .env files from .env.sample files
echo "Creating .env files from .env.sample files..."

# Root directory
if [ -f ".env.sample" ] && [ ! -f ".env" ]; then
  cp .env.sample .env
  echo "Created .env in root directory"
fi

# Auth service
if [ -f "auth-service/.env.sample" ] && [ ! -f "auth-service/.env" ]; then
  cp auth-service/.env.sample auth-service/.env
  echo "Created .env in auth-service directory"
fi

# User service
if [ -f "user-service/.env.sample" ] && [ ! -f "user-service/.env" ]; then
  cp user-service/.env.sample user-service/.env
  echo "Created .env in user-service directory"
fi

# Common service
if [ -f "common-service/.env.sample" ] && [ ! -f "common-service/.env" ]; then
  cp common-service/.env.sample common-service/.env
  echo "Created .env in common-service directory"
fi

# Install dependencies
echo "Installing dependencies..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm is not installed. Please install Node.js and npm first."
  exit 1
fi

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install auth-service dependencies
echo "Installing auth-service dependencies..."
cd auth-service
npm install
cd ..

# Install user-service dependencies
echo "Installing user-service dependencies..."
cd user-service
npm install
cd ..

# Install common-service dependencies
echo "Installing common-service dependencies..."
cd common-service
npm install
cd ..

echo "Local development environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Update the .env files with your actual values"
echo "2. Start the services using 'docker-compose up' or manually start each service"
echo "3. Access the GraphQL playground at http://localhost:3000/graphql"
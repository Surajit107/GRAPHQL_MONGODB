#!/bin/bash

# AWS Setup Script for GraphQL MongoDB Microservices
# This script helps set up AWS resources for deployment

# Exit on error
set -e

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Please install it first."
    exit 1
fi

# Configuration
REGION="us-east-1"  # Change to your preferred region
APP_NAME="graphql-mongodb"
SERVICES=("auth-service" "user-service" "common-service" "api-gateway")

# Ask for confirmation
echo "This script will create the following AWS resources:"
echo "- ECR repositories for each service"
echo "- SSM Parameters for secrets"
echo "- IAM roles for ECS"
echo ""
echo "Region: $REGION"
echo "Application name: $APP_NAME"
echo "Services: ${SERVICES[*]}"
echo ""
read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Set AWS region
aws configure set region $REGION

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"

# Create ECR repositories
echo "Creating ECR repositories..."
for service in "${SERVICES[@]}"; do
    repo_name="$APP_NAME-$service"
    if aws ecr describe-repositories --repository-names "$repo_name" 2>/dev/null; then
        echo "Repository $repo_name already exists"
    else
        aws ecr create-repository --repository-name "$repo_name" --image-scanning-configuration scanOnPush=true
        echo "Created repository $repo_name"
    fi
done

# Create SSM Parameters
echo "Creating SSM Parameters..."

# MongoDB URI parameters
aws ssm put-parameter \
    --name "/$APP_NAME/auth-service/MONGODB_URI" \
    --value "mongodb://your-mongodb-uri/auth-service" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/user-service/MONGODB_URI" \
    --value "mongodb://your-mongodb-uri/user-service" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/common-service/MONGODB_URI" \
    --value "mongodb://your-mongodb-uri/common-service" \
    --type "SecureString" \
    --overwrite

# JWT parameters
aws ssm put-parameter \
    --name "/$APP_NAME/auth-service/JWT_SECRET" \
    --value "change-this-to-a-secure-random-value" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/auth-service/JWT_ACCESS_EXPIRATION" \
    --value "15m" \
    --type "String" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/auth-service/JWT_REFRESH_EXPIRATION" \
    --value "7d" \
    --type "String" \
    --overwrite

# Email parameters
aws ssm put-parameter \
    --name "/$APP_NAME/common-service/SMTP_HOST" \
    --value "smtp.example.com" \
    --type "String" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/common-service/SMTP_PORT" \
    --value "587" \
    --type "String" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/common-service/SMTP_USER" \
    --value "your-smtp-username" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/common-service/SMTP_PASSWORD" \
    --value "your-smtp-password" \
    --type "SecureString" \
    --overwrite

aws ssm put-parameter \
    --name "/$APP_NAME/common-service/SMTP_FROM" \
    --value "noreply@example.com" \
    --type "String" \
    --overwrite

echo "SSM Parameters created. Please update them with your actual values."

# Create IAM roles for ECS
echo "Creating IAM roles for ECS..."

# Create ECS task execution role if it doesn't exist
if ! aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null; then
    echo "Creating ecsTaskExecutionRole..."
    
    # Create the role
    aws iam create-role \
        --role-name ecsTaskExecutionRole \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "ecs-tasks.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }'
    
    # Attach the required policies
    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    
    # Add permissions for SSM Parameter Store
    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
else
    echo "ecsTaskExecutionRole already exists"
fi

# Create ECS task role if it doesn't exist
if ! aws iam get-role --role-name ecsTaskRole 2>/dev/null; then
    echo "Creating ecsTaskRole..."
    
    # Create the role
    aws iam create-role \
        --role-name ecsTaskRole \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "ecs-tasks.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }'
    
    # Create a custom policy for the application
    aws iam create-policy \
        --policy-name "${APP_NAME}-policy" \
        --policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                        "logs:DescribeLogStreams"
                    ],
                    "Resource": "*"
                }
            ]
        }'
    
    # Attach the custom policy
    aws iam attach-role-policy \
        --role-name ecsTaskRole \
        --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${APP_NAME}-policy"
else
    echo "ecsTaskRole already exists"
fi

# Update the task definition file
echo "Updating task definition file..."
sed -i "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" aws-ecs-task-definition.json
sed -i "s/REGION/$REGION/g" aws-ecs-task-definition.json

echo "AWS setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the SSM parameters with your actual values"
echo "2. Create an ECS cluster and service"
echo "3. Set up GitHub repository secrets for CI/CD"
echo "4. Push to the main branch to trigger the deployment workflow"
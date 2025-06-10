FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm ci --only=production

# Create logs directory
RUN mkdir -p /app/logs

# Set environment variables
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
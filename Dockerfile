# ---- Build Stage ----
FROM node:20-alpine3.19 AS builder

WORKDIR /app
RUN apk update && apk upgrade --no-cache

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Build the app
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine3.19 AS production

WORKDIR /app
RUN apk update && apk upgrade --no-cache

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built files and necessary assets
COPY --from=builder /app/dist ./dist
COPY public ./public

# If you have a .env file, uncomment the next line
COPY .env .

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"] 
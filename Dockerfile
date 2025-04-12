FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build -w packages/frontend

# Build backend
RUN npm run build -w packages/backend

# Copy frontend build to backend public folder
RUN mkdir -p packages/backend/dist/public && \
    cp -r packages/frontend/dist/* packages/backend/dist/public/

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /app/packages/backend/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"] 
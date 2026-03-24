# ============================================
# FRONTEND DOCKERFILE - React + Vite
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Install ALL dependencies (dev + prod)
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
# Copy ONLY package files first - cache layer if unchanged
COPY package.json package-lock.json ./
RUN npm ci
# Copy source code AFTER dependencies installed
COPY . .

# Stage 2: Install PRODUCTION dependencies only
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 3: Build the application
FROM node:20-alpine AS build-env
WORKDIR /app
# Copy source code
COPY . .
# Copy dev dependencies from Stage 1
COPY --from=development-dependencies-env /app/node_modules ./node_modules
# Build-time environment variables for API URL
# Default: http://localhost:8080/api (local development)
# For production: Pass as --build-arg VITE_API_URL=https://yourdomain.com/api
# For Docker Compose: Pass as --build-arg VITE_API_URL=http://backend:8080/api
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 4: Production runtime
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy production dependencies from Stage 2
COPY --from=production-dependencies-env /app/node_modules ./node_modules

# Copy built application from Stage 3
COPY --from=build-env /app/build ./build

# Create shared volume mount point
RUN mkdir -p /app/shared

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "run", "start"]
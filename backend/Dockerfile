# Multi-stage Dockerfile for BRIDGE Backend API
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Expose backend API port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start command
CMD ["npm", "start"]

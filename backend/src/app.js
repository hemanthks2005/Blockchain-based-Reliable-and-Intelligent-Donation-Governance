import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { getHealth } from './controllers/health.controller.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import { sanitizeRequest } from './middleware/validator.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Dev friendly for local frontend & EVM connections
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching client URL
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with size limit (DOS protection)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Input sanitization middleware (strips NoSQL injection operators)
app.use(sanitizeRequest);

// Rate limiter for API routes
app.use(config.apiPrefix, apiLimiter);

// Root health check endpoint (per Sprint 1 DoD)
app.get('/health', getHealth);

// Versioned API routes
app.use(config.apiPrefix, apiRoutes);

// 404 Handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;

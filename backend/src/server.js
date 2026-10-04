import app from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

let server;

async function startServer() {
  try {
    logger.info('Starting BRIDGE Backend Server...');
    await connectDB();

    server = app.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(` BRIDGE Backend API is running!`);
      logger.info(` Environment: ${config.nodeEnv}`);
      logger.info(` Server URL:  http://localhost:${config.port}`);
      logger.info(` Health API:  http://localhost:${config.port}/health`);
      logger.info(` Versioned:   http://localhost:${config.port}${config.apiPrefix}/health`);
      logger.info(` Client URL:  ${config.clientUrl}`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();

import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDB() {
  const uri = config.mongoUri;
  logger.info(`Attempting MongoDB connection to: ${uri}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnected = false;
    logger.warn(`Could not connect to MongoDB at ${uri}: ${err.message}`);
    logger.warn('The server will continue running. Please start local MongoDB or provide MONGODB_URI in backend/.env.');
    return null;
  }
}

export function getDbStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;

  return {
    state: states[stateCode] || 'unknown',
    connected: stateCode === 1,
    configuredUri: config.mongoUri.replace(/:([^:@]{1,})@/, ':****@'),
    databaseName: mongoose.connection.name || 'bridge_db',
    host: mongoose.connection.host || '127.0.0.1',
    port: mongoose.connection.port || 27017,
  };
}

export async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error('Error during MongoDB disconnect:', err);
  }
}

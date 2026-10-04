import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bridge_db',
  useMemoryDb: process.env.USE_MEMORY_DB || 'auto',
  jwtSecret: process.env.JWT_SECRET || 'bridge_dev_super_secret_jwt_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  blockchainPrivateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  chainId: parseInt(process.env.CHAIN_ID || '1337', 10),
};

import { getDbStatus } from '../config/db.js';
import { blockchainService } from '../services/blockchain.service.js';

export async function getHealth(req, res) {
  const dbStatus = getDbStatus();
  const isHealthy = dbStatus.connected;
  let blockchainInfo = null;

  try {
    blockchainInfo = await blockchainService.getBlockchainStatus();
  } catch (err) {
    blockchainInfo = { status: 'offline', error: err.message };
  }

  const responseData = {
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0',
    service: 'BRIDGE Backend API',
    database: dbStatus,
    blockchain: blockchainInfo,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };

  res.status(200).json({
    success: true,
    data: responseData,
  });
}

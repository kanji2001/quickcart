import http from 'node:http';
import { app } from './app';
import { envConfig, isDevelopment } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './database/mongoose';
import { ensureInitialAdmin } from './bootstrap/ensure-admin';
import { ensureIndexes } from './bootstrap/ensure-indexes';

const startServer = async () => {
  await connectDatabase();
  await ensureIndexes();
  await ensureInitialAdmin();

  const server = http.createServer(app);

  server.listen(envConfig.port, () => {
    logger.info(`🚀 QuickCart API running on port ${envConfig.port} (${isDevelopment ? 'development' : 'production'} mode)`);
  });

  const shutdown = async (signal: string) => {
    logger.info('Received %s. Shutting down gracefully...', signal);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection: %o', reason);
    void shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception: %s', error.stack ?? error.message);
    void shutdown('uncaughtException');
  });
};

void startServer();


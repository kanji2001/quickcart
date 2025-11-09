import morgan from 'morgan';
import { logger } from '../config/logger';
import { isDevelopment } from '../config/env';

const stream: morgan.StreamOptions = {
  write: (message) => logger.http?.(message.trim()) ?? logger.info(message.trim()),
};

const skip = () => !isDevelopment;

export const requestLogger = morgan(isDevelopment ? 'dev' : 'combined', { stream, skip });


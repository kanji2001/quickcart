import mongoose from 'mongoose';
import { envConfig } from '../config/env';
import { logger } from '../config/logger';

mongoose.set('strictQuery', true);

export const connectDatabase = async () => {
  try {
    await mongoose.connect(envConfig.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 20,
      autoIndex: false,
    });

    logger.info('📦 Connected to MongoDB');
  } catch (error) {
    logger.error('❌ MongoDB connection error: %s', (error as Error).message);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  logger.info('🔌 Disconnected from MongoDB');
};


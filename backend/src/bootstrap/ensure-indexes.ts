import { logger } from '../config/logger';
import { ProductModel } from '../models/product.model';

export const ensureIndexes = async () => {
  try {
    await ProductModel.syncIndexes();
    logger.info('🔎 Product indexes synchronized');
  } catch (error) {
    logger.error('Failed to synchronize product indexes: %s', (error as Error).message);
    throw error;
  }
};


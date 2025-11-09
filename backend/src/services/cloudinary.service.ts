import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { envConfig } from '../config/env';
import { logger } from '../config/logger';

let isConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isConfigured) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = envConfig.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    logger.error(
      'Cloudinary credentials missing. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment.',
    );
    throw new Error('Cloudinary credentials are not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  logger.debug('Cloudinary configured for cloud "%s"', cloudName);
  isConfigured = true;
};

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string, options: UploadApiOptions = {}) => {
  ensureCloudinaryConfigured();
  logger.debug('Uploading asset to Cloudinary folder "%s"', folder);
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary upload failed: %o', error);
          reject(error);
        } else {
          logger.debug('Cloudinary upload success: %s', result.public_id);
          resolve(result);
        }
      },
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId);
};


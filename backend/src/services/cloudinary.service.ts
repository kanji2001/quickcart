import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string, options: UploadApiOptions = {}) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};


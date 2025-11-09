import multer from 'multer';
import { ApiError } from '../utils/api-error';
import { StatusCodes } from 'http-status-codes';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(
      new ApiError({
        message: 'Only image uploads are allowed',
        statusCode: StatusCodes.BAD_REQUEST,
      }),
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});


import { NextFunction, Request, Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { ApiError } from '../utils/api-error';
import { logger } from '../config/logger';
import { isDevelopment } from '../config/env';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(
    new ApiError({
      message: `Resource not found - ${req.originalUrl}`,
      statusCode: StatusCodes.NOT_FOUND,
    }),
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const apiError = err instanceof ApiError ? err : new ApiError({ message: err.message, statusCode: StatusCodes.INTERNAL_SERVER_ERROR });

  const statusCode = apiError.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = apiError.message || getReasonPhrase(statusCode);

  if (!apiError.isOperational || isDevelopment) {
    logger.error('Error processing request %s %s: %s', req.method, req.originalUrl, err.stack ?? err.message);
  } else {
    logger.warn('Operational error: %s', message);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: apiError.errors,
    stack: isDevelopment ? err.stack : undefined,
  });
};


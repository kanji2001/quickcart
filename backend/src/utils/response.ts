import { Response } from 'express';

type SuccessPayload<T> = {
  message: string;
  data?: T;
  statusCode?: number;
};

export const successResponse = <T>(res: Response, { message, data, statusCode = 200 }: SuccessPayload<T>): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};


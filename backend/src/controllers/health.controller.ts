import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'QuickCart API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};


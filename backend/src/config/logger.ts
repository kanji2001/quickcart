import path from 'node:path';
import { format, transports, createLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { envConfig, isDevelopment } from './env';

const logDirectory = path.resolve(process.cwd(), 'logs');

const logFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack ?? message}`;
});

const loggerTransports = [
  new transports.Console({
    level: isDevelopment ? 'debug' : 'info',
    format: format.combine(format.colorize(), format.timestamp(), format.errors({ stack: true }), logFormat),
  }),
  new DailyRotateFile({
    dirname: logDirectory,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: format.combine(format.timestamp(), format.errors({ stack: true }), logFormat),
  }),
  new DailyRotateFile({
    dirname: logDirectory,
    filename: 'errors-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: format.combine(format.timestamp(), format.errors({ stack: true }), logFormat),
  }),
];

export const logger = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  defaultMeta: { service: 'quickcart-backend', environment: envConfig.nodeEnv },
  transports: loggerTransports,
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.splat(), logFormat),
});


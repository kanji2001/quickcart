import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { raw } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import { envConfig, isProduction } from './config/env';
import { requestLogger } from './middlewares/request-logger';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { sanitizeRequest } from './middlewares/security';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(
  cors({
    origin: envConfig.clientUrl,
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  }),
);
app.use(sanitizeRequest);
app.use('/api/v1/payment/webhook', raw({ type: 'application/json' }));
app.use(cookieParser(envConfig.cookieSecret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(requestLogger);

const sanitizeObject = (obj: unknown): unknown => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj as Record<string, unknown>).forEach((key) => {
      const value = (obj as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        (obj as Record<string, unknown>)[key] = xss(value);
      } else if (typeof value === 'object' && value !== null) {
        (obj as Record<string, unknown>)[key] = sanitizeObject(value);
      }
    });
  }
  return obj;
};

app.use((req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickCart API is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };


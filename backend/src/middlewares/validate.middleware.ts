import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnyZodObject } from 'zod';
import { ApiError } from '../utils/api-error';

export const validateResource =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      throw new ApiError({
        message: 'Validation error',
        statusCode: StatusCodes.BAD_REQUEST,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { body, params, query } = result.data;
    if (body) {
      req.body = body;
    }
    if (params) {
      Object.assign(req.params as Record<string, unknown>, params);
    }
    if (query) {
      const currentQuery = req.query as Record<string, unknown>;
      Object.keys(currentQuery).forEach((key) => {
        delete currentQuery[key];
      });
      Object.assign(currentQuery, query);
    }
    next();
  };


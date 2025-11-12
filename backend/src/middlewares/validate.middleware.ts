import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodTypeAny } from 'zod';
import { ApiError } from '../utils/api-error';

export const validateResource =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    type ParsedOutput = {
      body?: Request['body'];
      params?: Request['params'];
      query?: Request['query'];
    };

    type ValidationResult =
      | {
          success: true;
          data: ParsedOutput;
        }
      | {
          success: false;
          error: ZodError;
        };

    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    }) as ValidationResult;

    if (!result.success) {
      throw new ApiError({
        message: 'Validation error',
        statusCode: StatusCodes.BAD_REQUEST,
        errors: Object.entries(result.error.flatten().fieldErrors).map(([field, messages]) => ({
          field,
          messages,
        })),
      });
    }

    const { body, params, query } = result.data ?? {};
    if (body) {
      req.body = body;
    }
    if (params) {
      req.params = params;
    }
    if (query) {
      req.query = query;
    }
    next();
  };


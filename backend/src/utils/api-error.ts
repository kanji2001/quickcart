import { StatusCodes } from 'http-status-codes';

type ErrorParams = {
  message: string;
  statusCode?: number;
  errors?: unknown[];
  isOperational?: boolean;
};

export class ApiError extends Error {
  public readonly statusCode: number;

  public readonly errors: unknown[];

  public readonly isOperational: boolean;

  constructor({ message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, errors = [], isOperational = true }: ErrorParams) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}


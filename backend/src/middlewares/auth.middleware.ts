import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/api-error';
import { tokenService } from '../services/token.service';
import { UserModel } from '../models';

export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    throw new ApiError({ message: 'Authorization token missing', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const token = authorization.split(' ')[1];
  const payload = tokenService.verifyAccessToken(token);

  const user = await UserModel.findById(payload.sub);

  if (!user) {
    throw new ApiError({ message: 'User not found', statusCode: StatusCodes.UNAUTHORIZED });
  }

  req.user = user;
  req.authToken = token;
  next();
});

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError({ message: 'Access denied', statusCode: StatusCodes.FORBIDDEN });
  }
  next();
};


import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { supportService } from '../services/support.service';
import { successResponse } from '../utils/response';

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  await supportService.submitContactRequest(req.body);

  return successResponse(res, {
    message: 'Thanks for contacting us. Our support team will reach out soon.',
    statusCode: StatusCodes.CREATED,
  });
});



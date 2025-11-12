import crypto from 'node:crypto';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { razorpayClient } from '../lib/razorpay';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { envConfig } from '../config/env';
import { OrderModel } from '../models';

export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { amount, currency = 'INR', receipt } = req.body;

  const order = await razorpayClient.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    payment_capture: true,
  });

  return successResponse(res, {
    message: 'Razorpay order created',
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: envConfig.razorpay.keyId,
    },
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', envConfig.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError({ message: 'Invalid payment signature', statusCode: StatusCodes.BAD_REQUEST });
  }

  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new ApiError({ message: 'Order not found', statusCode: StatusCodes.NOT_FOUND });
  }

  order.markPaid({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paidAt: new Date(),
  });
  order.statusHistory.push({ status: 'processing', date: new Date(), note: 'Payment confirmed' });
  order.orderStatus = 'processing';
  await order.save();

  return successResponse(res, {
    message: 'Payment verified successfully',
    data: { order },
  });
});

export const handleRazorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  if (!envConfig.razorpay.webhookSecret) {
    res.status(StatusCodes.OK).json({
      received: false,
      message: 'Webhook secret not configured; webhook events are ignored.',
    });
    return;
  }

  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
  const body = rawBody.toString();

  const expectedSignature = crypto
    .createHmac('sha256', envConfig.razorpay.webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new ApiError({ message: 'Invalid webhook signature', statusCode: StatusCodes.BAD_REQUEST });
  }

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const razorpayOrderId = event.payload.payment.entity.order_id;
    const paymentId = event.payload.payment.entity.id;

    await OrderModel.findOneAndUpdate(
      { 'paymentDetails.razorpayOrderId': razorpayOrderId },
      {
        paymentStatus: 'completed',
        paymentDetails: {
          razorpayOrderId,
          razorpayPaymentId: paymentId,
          paidAt: new Date(),
        },
      },
    );
  }

  res.status(StatusCodes.OK).json({ received: true });
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new ApiError({ message: 'Order not found', statusCode: StatusCodes.NOT_FOUND });
  }

  if (!order.paymentDetails?.razorpayPaymentId) {
    throw new ApiError({ message: 'Payment not captured', statusCode: StatusCodes.BAD_REQUEST });
  }

  await razorpayClient.payments.refund(order.paymentDetails.razorpayPaymentId, {
    amount: Math.round(order.totalAmount * 100),
  });

  order.paymentStatus = 'refunded';
  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', date: new Date(), note: 'Refund processed' });
  await order.save();

  return successResponse(res, {
    message: 'Refund initiated successfully',
    data: { order },
  });
});


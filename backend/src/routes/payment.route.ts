import { Router, raw } from 'express';
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
  refundPayment,
  verifyRazorpayPayment,
} from '../controllers/payment.controller';
import { isAdmin, protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import {
  createPaymentOrderSchema,
  refundParamSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator';

const router = Router();

router.post('/create-order', protect, validateResource(createPaymentOrderSchema), createRazorpayOrder);
router.post('/verify', protect, validateResource(verifyPaymentSchema), verifyRazorpayPayment);
router.post('/webhook', raw({ type: 'application/json' }), handleRazorpayWebhook);
router.post('/refund/:orderId', protect, isAdmin, validateResource(refundParamSchema), refundPayment);

export const paymentRouter = router;


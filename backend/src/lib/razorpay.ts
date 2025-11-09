import Razorpay from 'razorpay';
import { envConfig } from '../config/env';

export const razorpayClient = new Razorpay({
  key_id: envConfig.razorpay.keyId,
  key_secret: envConfig.razorpay.keySecret,
});


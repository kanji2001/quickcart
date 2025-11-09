import { Router } from 'express';
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  verifyEmail,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateResource(registerSchema), register);
router.post('/login', validateResource(loginSchema), login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateResource(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateResource(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', protect, getCurrentUser);

export const authRouter = router;

